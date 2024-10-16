import { MastodonApi, tryBskyLogin } from "@app/social";
import { Classification, Item } from "@prisma/client";
import { CLASSIFIERS } from "../classify/classifiers";
import { Classification_Source, classifySources } from "../classify/classify";
import { fetchBlueskyStatusesSimple } from "../util/BlueskyStatusToSimple";
import ClassificationsApi from "./Classifications";
import ItemsApi, { Processed } from "./Items";

export default class InjestService{
    constructor(private classificationApi:ClassificationsApi,private itemsDb:ItemsApi,private config :{

        makeUrl:(endpoint:string,args?:any) => string
    }) {
    }

    private makeUrl(endpoint:string,args?:any) {
        return this.config.makeUrl(endpoint,args);
    }

    async classifyItems(items: Item[],type:string):Promise<{
        created: number,
        prepared: Omit<Classification, 'uuid'>[],
    }> {
        const sources: Classification_Source[] = [];
        items.forEach(item => {
            //remove html tags
            const text = item.content.replace(/<[^>]*>?/gm, '');
            sources.push({
                text,
                sourcetype: type,
                id: item.uuid
            });
        });
        const classifications = classifySources(sources,CLASSIFIERS);
        const prepared : Omit<Classification, 'uuid'>[] = [];
        Object.keys(classifications).forEach(item => {
            classifications[item].forEach(classification => {
                prepared.push({
                    item,
                    item_type: type,
                    classification,
                    parent: null,
                });

            });

        });
        const created = await this.classificationApi.createMany(prepared);
        return {
            created,
            prepared,
        }
    }


    async classify(page:number,perPage:number,source:string) {
        const items = await this.itemsDb.all({
            page,
            perPage,
            source: source != 'bluesky' ?  source  : undefined,
            sourceType: source == 'bluesky' ? source : undefined,
        });
        const totalPages = await this.itemsDb.totalPages({
            perPage,
            source: source != 'bluesky' ?  source  : undefined,
            sourceType: source == 'bluesky' ? source : undefined,
        });
        const {
            created,
            prepared
        } = await this.classifyItems(items,source);
        return {
            created,
            prepared,
            totalPages,
        }
    }

    async injestMastodon({
        accountId,
        maxId,
        instanceUrl,
        slug
    }:{
        accountId:string,
        instanceUrl:string,
        slug:'mastodonSocial'|'fosstodon',
        maxId?:string
    }):Promise<{
        maxId?:string,
        next?:string,
        nextCursor?:string,
        cursor?:string,
        items: Processed[],
        accountId:string,
    }> {
        const api = new MastodonApi(instanceUrl);
        const statuses = await api.getStatuses({accountId,maxId});
        if( ! statuses || statuses.length === 0) {
            throw new Error("No statuses found");
        }
        const lastId = statuses[statuses.length - 1].id;
        const items = await this.itemsDb.injestMastodon({statuses,source:slug});
        return {
            maxId,
            next: this.makeUrl(`/api/items/injest/mastodon/${accountId}`,{maxId:lastId}),
            nextCursor:lastId,
            cursor: maxId,
            items,
            accountId,
        };

    }

    async injestBlueSky({
        did,
        cursor,
        bluesky
    } : {
        did:string,
        cursor?:string,
        bluesky: {
            identifier:string,
            password:string,
        },
    }):Promise<{
        cursor?:string,
        next?:string,
        nextCursor?:string,
        items: Processed[],
        did:string,
    }> {
        const agent = await tryBskyLogin({
            identifier: bluesky.identifier,
            password: bluesky.password,
        });
        const returnValue = await fetchBlueskyStatusesSimple({
            agent: agent.agent,
            actor: did,
            cursor,
            makeNextUri: (did,cursor) => this.makeUrl(`/api/items/injest/bluesky/${did}`,{cursor}),
        })
        const items = await this.itemsDb.injestBluesky({statuses:returnValue.statuses});
        if( ! items || items.length === 0) {
            throw new Error("No items created");

        }
        return {
            cursor: returnValue.cursor,
            next: returnValue.next,
            nextCursor: returnValue.nextCursor?.replace('cursor=',''),
            items,
            did,

        };
    }


}

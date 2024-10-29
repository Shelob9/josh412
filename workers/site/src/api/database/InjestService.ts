import { MastodonApi, tryBskyLogin } from "@app/social";
import { ServiceConfig } from "@lib/config";
import { Classification, Item, Media } from "@prisma/client";
import { CLASSIFIERS } from "../classify/classifiers";
import { Classification_Source, classifySources } from "../classify/classify";
import { fetchBlueskyStatusesSimple } from "../util/BlueskyStatusToSimple";
import { fetchMedia } from "../util/fetchMedia";
import ClassificationsApi from "./Classifications";
import ItemsApi, { ItemSource, Processed } from "./Items";


export default class InjestService{
    constructor(
        private classificationApi:ClassificationsApi,
        private itemsDb:ItemsApi,
        private BUCKET: R2Bucket,
        private config :ServiceConfig & {
            bluseskyPassword:string,
            makeUrl:(endpoint:string,args?:any) => string,
            //per each account, which classifications to upload medias for
        }) {
    }

    private makeUrl(endpoint:string,args?:any) {
        return this.config.makeUrl(endpoint,args);
    }

    async sync(){
        let totalCreated = 0;
        const maxTimesNoNewItems = 5;
        console.log(`start mastodon sync`);
        await Promise.all(this.config.social.mastodon.map(async ({
            accountId,
            instanceUrl,
            slug,

        }) => {
            console.log(`start mastodon sync for ${slug}`);
            let newItems : Processed[] = [];
            let ranOnce = false;
            let maxId :string|undefined = undefined;
            let timesNoNewItems = 0;
            //while ranOnce is false or maxId is not undefined
            while( ! ranOnce || maxId ){
                try {
                    newItems = [];
                    const returnValue = await this.injestMastodon({
                        accountId,
                        maxId,
                        instanceUrl,
                        slug: slug as 'mastodonSocial'|'fosstodon'
                    });
                    newItems = returnValue.items.filter( i => i.created);
                    console.log({
                        slug,
                        newItems
                    })
                    if( newItems.length > 0){
                        await this.classifyItems(newItems,'mastodon');
                    }else{
                        timesNoNewItems++;
                        totalCreated += newItems.length;
                    }
                    if(returnValue.maxId){
                        maxId = returnValue.maxId;
                    }else{
                        maxId = undefined;
                    }
                    ranOnce = true;
                } catch (error) {
                    console.error({error});
                    break;
                }
                if(timesNoNewItems > maxTimesNoNewItems){
                    break;
                }
            }


        }))
        console.log(`Start bluesky sync`);
        await Promise.all(this.config.social.bluesky.map(async ({
            did,name
        }) => {
            let timesNoNewItems = 0;
            console.log(`start bluesky sync for ${name}`);
            let ranOnce = false;
            let newItems : Processed[] = [];
            let cursor :string|undefined = undefined;
            while( ! ranOnce || cursor ){
                try {
                    newItems = [];
                    const returnValue = await this.injestBlueSky({
                        did,
                        cursor,
                        bluesky: {
                            identifier: did,
                            password: this.config.bluseskyPassword,
                        }
                    });
                    //Classify
                    newItems = returnValue.items.filter( i => i.created);
                    console.log({
                        newItems: newItems
                    })
                    if( newItems.length > 0){
                        console.log(`Classifying ${newItems.length} items`);
                        const classified = await this.classifyItems(newItems,'bluesky');
                        console.log(`Classified ${classified.created} items`);
                    }else{
                        timesNoNewItems++;
                        totalCreated += newItems.length;

                    }
                    if(returnValue.cursor){
                        cursor = returnValue.cursor;
                    }else{
                        cursor = undefined;
                    }
                    ranOnce = true;

                } catch (error) {
                    console.error({error});
                    break;
                }
                if(timesNoNewItems > maxTimesNoNewItems){
                    break;
                }
            }

        }));
        return totalCreated;
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
                    createdAt: new Date(),
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

    async syncMedia(){
        console.log(`Starting media upload`);
        Object.keys(this.config.mediaUploads).forEach(async (account) => {
            await Promise.all(this.config.mediaUploads[account as ItemSource].map(
                async classification => {
                    console.log(`Getting items to upload for ${account} and ${classification}`);
                    try {
                        const itemUuids = await this.getItemsToUploadMedia({
                            itemType: account as ItemSource,
                            classification,

                        }).catch((error) => {
                            console.log({
                                getItemsToUploadMediaError: true,
                                error
                            })
                        });
                        console.log(`Getting media for ${itemUuids ? itemUuids.length:0} items for ${account} and ${classification}`);

                        const medias = itemUuids ? await this.itemsDb.allMediasByItemsUuids(itemUuids,true) : [];
                        console.log(`Found ${medias.length} media items for ${account} and ${classification}`);
                        if(!medias || medias.length === 0){
                            return;
                        }
                        await Promise.all(
                            medias.map(
                                async media => {
                                    if(! media.key  && media.url){
                                        await this.uploadBlobForMedia(media).catch((error) => {
                                            console.log({
                                                uploadBlobForMediaError: true,
                                                error
                                            })
                                        })
                                    }
                                }
                            )
                        );

                        console.log(`Done uploading media items for ${account} and ${classification}`);
                    } catch (error) {
                        console.log(`Error uploading media for ${account} and ${classification}`);

                    }
                })
            );
        });

    }

    async uploadBlobForMedia(media:Media){
        try {
            const fetchedMedia = await fetchMedia(media.url);
            if(  fetchedMedia){
                const key = media.url.split('/').pop();
                await this.BUCKET.put(key as string,fetchedMedia.data);
                await this.itemsDb.setMediaKey({
                    uuid: media.uuid,
                    key: key as string
                });

            }
        } catch (error) {
            console.log({
                uploadBlobForMediaError: true,
                error
            })
        }
    }

    async uploadMediaForItem(itemUuid:string){
        const item = await this.itemsDb.get(itemUuid);
        if( ! item){
            throw new Error("Item not found");
        }
        const medias = await this.itemsDb.getItemMedia({
            item: item.uuid
        });
        if( ! medias || medias.length === 0){
            throw new Error("No media found");
        }
        await Promise.all(
            medias.map(
                async media =>
                await this.uploadBlobForMedia(media)
            )
        );
    }


    async getItemsToUploadMedia({itemType,classification}:{classification:string;itemType:ItemSource}):Promise<string[]> {
        let page = 1;
        const items : string[] = [];
        let notDone = true;
        while(notDone){
            const classifications = await this.classificationApi.allForSource({
                source: itemType,
                classification,
                page: page,
                perPage: 25,
            })
            if( ! classifications || classifications.length === 0) {
                notDone = false;
            }
            for (const classification of classifications) {
                items.push(classification.item);
            }
            page++;
        }
        return items;
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

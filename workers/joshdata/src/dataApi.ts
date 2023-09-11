import { DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import { Status } from "./social/types/mastodon";
import { INSERT_CLASSIFICATION, SAVED_CLASSIFICATION, TABLE_classifications } from "./db/schema";
import { eq } from "drizzle-orm";
import { Env } from "./env";
import { getStatuses } from "./social/mastodon";

type NETWORK_INSTANCE = {
    network: string;
    instanceUrl: string;
}
type NETWORK_INSTANCE_ID = {
    network: string;
    instanceUrl: string;
    id: string;
}

export const makeSourceType = ({
    network,
    instanceUrl,
}: NETWORK_INSTANCE) => {
    if( instanceUrl.startsWith('https://') ){
        instanceUrl = instanceUrl.replace('https://', '' );
    }
    return `socialpost:${network}:${instanceUrl}`;
}
export const makeSocialPostKey = ({network,instanceUrl,id}:NETWORK_INSTANCE_ID) => {
    return `${makeSourceType({network,instanceUrl})}:${id}`;
}

export const makeInjestLastKey = ({network,instanceUrl}:NETWORK_INSTANCE) => {
    return `meta_socialpost:injest:${makeSourceType({network,instanceUrl})}:lastid`;
}

export type SavedStatusMetaData ={
    itemtype: string;
    itemid: string;
};

export class DataService {
    kv: KVNamespace;
    d1: DrizzleD1Database;
    constructor(env: Env ){
        this.kv = env.KV
        this.d1 = drizzle(env.DB1);
    }

    async getStatusApi(network:string): Promise<StatusDataApi> {
        return new StatusDataApi(network,this.kv,this.d1);
    }

    async getSocialInjestTrack(network:string,instanceUrl:string): Promise<SocialInjestTrack> {
        return new SocialInjestTrack(network,instanceUrl,this.kv);
    }

    async getSavedStatuses({
        network,
        instanceUrl,
        cursor,
    }:{
        network:string,
        instanceUrl: string,
        cursor?:string
    }): Promise<{
        statuses: Status[];

    }> {
        const api = await this.getStatusApi(network);
        const {statuses} = await api.getSavedSatuses(
            instanceUrl,
            cursor
        );
        return {
            statuses,
        };

    }

    async injestSocialPosts({
        network,
        instanceUrl,
        accountId,
        stopAfter,

    }:
    {
        network:string,
        instanceUrl:string,
        accountId:number,
        stopAfter?: number,

    }): Promise<{
        lastId: string|false|null;
        done: boolean;
    }> {
        const api = await this.getStatusApi(network);
        const track = await this.getSocialInjestTrack(network,instanceUrl);
        let lastId = await track.getLastId();
        let done = await track.isDone();
        const statuses = await getStatuses(
            instanceUrl,
            accountId,
            lastId ? lastId : undefined,
        );
        if( ! statuses ){
            return {
                lastId: null,
                done: true,
            };
        }
        for( const status of statuses ){
            await api.saveStatus(status,{
                instanceUrl,
            });

        }
        if( statuses.length === 1 ){
            await track.setIsDone();
            return {
                lastId: statuses[0].id,
                done: true,
            };
        }
        lastId = statuses[statuses.length-1].id;
        await track.storeLastId(lastId);
        done = await track.isDone();

        return {
            lastId,
            done,
        };
    }
}

export class SocialInjestTrack {
    network: string;
    instanceUrl: string;
    kv: KVNamespace;

    static DONE_FLAG: string = 'done';
    constructor(network:string,instanceUrl:string,kv:KVNamespace){
        this.network = network;
        this.instanceUrl = instanceUrl;
        this.kv = kv;
    }
    async getLastId(): Promise<string|false|null> {
        const lastId = await this.kv.get(makeInjestLastKey({network:this.network,instanceUrl:this.instanceUrl}));
        if( SocialInjestTrack.DONE_FLAG === lastId ){
            return false;
        }
        return lastId ? lastId : null;
    }

    async storeLastId(newValue: string) {
        await this.kv.put(makeInjestLastKey({network:this.network,instanceUrl:this.instanceUrl}),newValue);
    }

    async setIsDone() {
        await this.kv.put(
            makeInjestLastKey({network:this.network,instanceUrl:this.instanceUrl}),
            SocialInjestTrack.DONE_FLAG
        );
    }

    async isDone() {
        const lastId = await this.getLastId();
        return SocialInjestTrack.DONE_FLAG === lastId;
    }
}



export class StatusDataApi {
    network: string;
    kv: KVNamespace;
    d1: DrizzleD1Database;
    constructor(network:string,kv:KVNamespace,d1: DrizzleD1Database ){
        this.network = network;
        this.kv = kv;
        this.d1 = d1;
    }
    async getSavedStatus ({statusId,instanceUrl}: {
        statusId: string;
        instanceUrl:string;
    }): Promise<{
        status: Status|null;
        //classifications: string[];
    }> {
        const data = await this.kv.get(makeSocialPostKey({
            network:this.network,
            instanceUrl,
            id:statusId,
        }));
        if( !data ){
            return {
                status: null,
                //classifications: [],
            };
        }


        return {
            //classifications: [],
            //@ts-ignore
            status: this.prepareStatus(
               JSON.parse(data)
           ),
        }

    }
    async getSavedSatuses(instanceUrl:string,cursor?:string): Promise<{
        statuses: Status[];
        complete: boolean;
        cursor: string|false;
    }>{
        const keys = await this.kv.list({
            prefix: makeSourceType({network:this.network,instanceUrl:instanceUrl}),
            limit: 1000,
            cursor,
        });
        const statuses = await Promise.all(
            keys.keys.map(
                async (key:{name:string}) => {
                    const data = await this.kv.get(key.name);
                    if( !data ){
                        return null;
                    }
                    //@ts-ignore
                    return this.prepareStatus(
                        JSON.parse(data)
                    );
                }
            ));


            return  {
                complete: keys.list_complete,
                cursor: keys.list_complete ? false : keys.cursor,
                statuses: statuses.filter( (status:Status|null) => {
                    return status !== null;
                }) as Status[],
            };
    }

    private prepareStatus(status: Status): Status {
        return {
            ...status,
            // @ts-ignore
            account: {
                id: status.account.id,
                username: status.account.username,
                display_name: status.account.display_name,
                avatar: status.account.avatar,
                url: status.account.url,
            },
        };
    }
    async saveStatus(status:  Status, {
        instanceUrl,
        classificationids,
    }:{
        instanceUrl:string,classificationids?:string[]
    }){
        const metadata: SavedStatusMetaData = {
            itemtype: makeSourceType({
                network:this.network,
                instanceUrl,
            }),
            itemid: status.id,
        };
        await this.kv.put(
            makeSocialPostKey({
                network:this.network,
                instanceUrl: status.account.url,
                id: status.id,
            }),
            JSON.stringify(this.prepareStatus(status)),
            {
                metadata
            }

        );
        if( classificationids ){
            await this.saveClassifications({
                statusId:status.id,
                classifications: classificationids,
                instanceUrl
            });
        }

    }


    //Functions for classifications, which are stored in d1

    async createClassification(classification:INSERT_CLASSIFICATION): Promise<void> {
        const now = new Date;
        await this.d1.insert(TABLE_classifications).values({
            ...classification,
            created: now,
            updated: now,
        });
    }

    async getOrCreateClassification(classification:INSERT_CLASSIFICATION): Promise<SAVED_CLASSIFICATION> {
        const existing = await this.d1.select().from(TABLE_classifications).where(
            eq(TABLE_classifications.slug,classification.slug)
        ).limit(1);
        if( existing.length > 0 ){
            return existing[0];
        }
        await this.createClassification(classification);
        return await this.getOrCreateClassification(classification);
    }


    /**
     *
     * @param statusId ID of status to save for
     * @param classifications Array of classification slugs to save
     * @param subtype Optional. Use for subtype of classification if passed
     */
    async saveClassifications ({
        statusId,
        classifications,
        subtype,
        instanceUrl,
    }:{statusId:string, classifications: string[],instanceUrl:string;subtype?:string}) {
        const {
            status: savedStatus,
            //classifications: savedClassifications,
         } = await this.getSavedStatus({statusId,instanceUrl});
        if( ! savedStatus ){
            throw new Error(`Status not found: ${statusId}`);
        }
        classifications.map(
            async (slug:string) => {
                const classification = await this.getOrCreateClassification({
                    slug,
                    subtype,
                    itemid: statusId,
                    itemtype: makeSourceType({
                        network: this.network,
                        instanceUrl: savedStatus.account.url,
                    }),
                });
                return classification.id;
            }
        );

    }

}

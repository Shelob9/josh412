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
export const makeSocialPostKey = ({network,instanceUrl,id,accountId}:{
    network: string;
    instanceUrl: string;
    id: string;
    accountId: string;
}) => {
    return `${makeSourceType({network,instanceUrl})}:A_${accountId}:${id}`;
}

export const makeInjestLastKey = ({network,instanceUrl,accountId}:{
    accountId:string,
    network: string,
    instanceUrl: string,
}) => {
    return `meta_socialpost:injest:${makeSourceType({network,instanceUrl})}:A_${accountId}:lastid`;
}

export type SavedStatusMetaData ={
    itemtype: string;
    itemid: string;
    accountId: string;
    instanceUrl: string;
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
        let lastId = await track.getLastId(accountId.toString());
        let done = await track.isDone(accountId.toString());
        let itterations = 0;
        while( !done ){
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
                    accountId: accountId.toString(),
                });

            }
            if( statuses.length === 1 ){
                await track.setIsDone(accountId.toString());
                return {
                    lastId: statuses[0].id,
                    done: true,
                };
            }
            lastId = statuses[statuses.length-1].id;
            await track.storeLastId(accountId.toString(),lastId);
            done = await track.isDone(accountId.toString());
            itterations++;
            if( stopAfter && itterations >= stopAfter ){
                return {
                    lastId,
                    done,
                };
            }
        }

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
    async getLastId(accountId:string): Promise<string|false|null> {
        const lastId = await this.kv.get(makeInjestLastKey({
            network:this.network,
            instanceUrl:this.instanceUrl,
            accountId
        }));
        if( SocialInjestTrack.DONE_FLAG === lastId ){
            return false;
        }
        return lastId ? lastId : null;
    }

    async storeLastId(accountId:string,newValue: string) {
        await this.kv.put(makeInjestLastKey(
            {
                network:this.network,
                instanceUrl:this.instanceUrl,
                accountId
            }),newValue);
    }

    async setIsDone(accountId:string) {
        await this.kv.put(
            makeInjestLastKey({
                network:this.network,
                instanceUrl:this.instanceUrl,
                accountId
            }),
            SocialInjestTrack.DONE_FLAG
        );
    }

    async isDone(accountId:string) {
        const lastId = await this.getLastId(accountId);
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
    async  getSavedSatus({instanceUrl,accountId,statusId}:{
        instanceUrl:string;
        accountId:string;
        statusId:string;
    }): Promise<{
        status: Status|null;
        key: string;
    }>{
        const key = makeSocialPostKey({
            network:this.network,
            instanceUrl: instanceUrl,
            id: statusId,
            accountId,
        });
        const data = await this.kv.get(key);
        if( !data ){
            return {
                status: null,
                key: key,
            }
        }
        return {
            //@ts-ignore
            status: this.prepareStatus(
                JSON.parse(data)
            ),
            key: key,
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

    async deleteAllStatuses(instanceUrl:string): Promise<void> {
        let keys = await this.kv.list({
            prefix: makeSourceType({network:this.network,instanceUrl:instanceUrl}),
            limit: 1000,
        });

        await Promise.all(
            keys.keys.map(
                async (key:{name:string}) => {
                    await this.kv.delete(key.name);
                }
            ));

    }

    async saveStatus(status:  Status, {
        instanceUrl,
        accountId,
        classificationids,
    }:{
        instanceUrl:string,
        accountId:string;
        classificationids?:string[]
    }){
        const metadata: SavedStatusMetaData = {
            itemtype: makeSourceType({
                network:this.network,
                instanceUrl,

            }),
            itemid: status.id,
            accountId,
            instanceUrl,
        };
        await this.kv.put(
            makeSocialPostKey({
                network:this.network,
                instanceUrl: status.account.url,
                id: status.id,
                accountId,
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
                instanceUrl,
                accountId,
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
        accountId,
    }:{
        statusId:string,
        classifications: string[],
        instanceUrl:string;
        accountId:string,
        subtype?:string
    }) {
        const {
            status: savedStatus,
            //classifications: savedClassifications,
         } = await this.getSavedStatus({statusId,instanceUrl,accountId});
        if( ! savedStatus ){
            throw new Error(`Status not found: ${statusId}`);
        }
        classifications.map(
            async (slug:string) => {
                const classification = await this.getOrCreateClassification({
                    slug,
                    subtype,
                    itemid: statusId,
                    itemtype: `socialpost`,
										subtype: makeSourceType({
                        network: this.network,
                        instanceUrl: savedStatus.account.url,
                    }),
                });
                return classification.id;
            }
        );

    }

}

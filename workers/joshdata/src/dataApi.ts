import { DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import { MediaAttachment,ImageAttachment, Status } from "@social";
import {
    INSERT_CLASSIFICATION,
    INSERT_IMAGE,
    SAVED_CLASSIFICATION,
    TABLE_classifications,
    TABLE_media
} from "./db/schema";
import { and, eq } from "drizzle-orm";
import { Env } from "./env";
import { getStatuses } from "@social";
import {makeSourceType,makeSocialPostKey} from './kvUtil';
import { CLASSIFICATION_SOURCE_TYPES, Classification_Source, ITEM_TYPE_SOCIAL_POST, classifySources } from "./classify";
import { InjestQueueApi, SocialInjestTrack } from "./dataApi/InjestApi";
import MediaApi from "./dataApi/MediaApi";
import { CLASSIFIERS } from "./classifiers";

export type SAVED_STATUS = Status & {key:string};

export type SavedStatusMetaData ={
    itemtype: string;
    itemid: string;
    accountId: string;
    instanceUrl: string;
};

const statusToSource = (status: SAVED_STATUS, network: string): Classification_Source => {
    const { id, content } = status;
    return {
        id,
        text: content,
        sourcetype: network,
    };
};

const statusesToSources = (statuses: SAVED_STATUS[], network: string): Classification_Source[] => {
    return statuses.map((status:SAVED_STATUS) => statusToSource(status, network));
};

export class DataService {
    kv: KVNamespace;
    d1: DrizzleD1Database;
    CDN_BUCKET: R2Bucket;
    INJEST_QUEUE: Queue;
    constructor(env: Env ){
        this.kv = env.KV
        this.d1 = drizzle(env.DB1);
        this.CDN_BUCKET = env.CDN_BUCKET;
        this.INJEST_QUEUE = env.INJEST_QUEUE;
    }

    async getStatusApi(network:string): Promise<StatusDataApi> {
        return new StatusDataApi(network,this.kv,this.d1);
    }

    async getSocialInjestTrack(network:string,instanceUrl:string): Promise<SocialInjestTrack> {
        return new SocialInjestTrack(network,instanceUrl,this.kv);
    }

    async getMediaApi (): Promise<MediaApi> {
        return new MediaApi(this.kv,this.d1,this.CDN_BUCKET);
    }

    async getInjestQueueApi (): Promise<InjestQueueApi> {
        return new InjestQueueApi(this);
    }


    async injestSocialPosts({
        network,
        instanceUrl,
        accountId,
        resetFirst
    }:
    {
        network:string,
        instanceUrl:string,
        accountId:number,
        resetFirst?: boolean,
    }): Promise<{
        lastId: string|false|null;
        done: boolean;
        statuses?: Status[];
        injestKey: string;
        newLastId?: string;
    }> {
        const api = await this.getStatusApi(network);
        const track = await this.getSocialInjestTrack(network,instanceUrl);
        if( resetFirst ){
            await track.reset(accountId.toString());
        }
        await api.deleteAllStatuses(instanceUrl,accountId.toString());
        let lastId = await track.getLastId(accountId.toString());
        let done = await track.isDone(accountId.toString());
        const statuses = await getStatuses(
            instanceUrl,
            accountId,
            lastId?.toString(),
        );
        if( ! statuses ){
            return {
                lastId: null,
                done: true,
                injestKey: track.injestKey(accountId.toString()),

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
                lastId:statuses[0].id,
                done: true,
                injestKey: track.injestKey(accountId.toString()),
                statuses,
            };
        }
        const newLastId = statuses[statuses.length-1].id;
        if( newLastId ){
            await track.storeLastId(accountId.toString(),newLastId);
            done = await track.isDone(accountId.toString());
        }

        return {
            statuses,
            lastId,
            newLastId,
            injestKey: track.injestKey(accountId.toString()),
            done,
        };
    }

    async classifySocialPosts({
        network,
        instanceUrl,
        accountId,
        cursor
    }:{
        network:string,
        instanceUrl:string,
        accountId:number,
        cursor?:string

    }): Promise<{
        sCursor: string|false;
        complete: boolean;
        cIds: string[];
        errors: {
            statusId:string,
            classificationId:string,
            error:any
        }[]
    }> {
        const api = await this.getStatusApi(network);
        const {statuses,cursor:sCursor,complete} =
            await api.getSavedSatuses(instanceUrl,accountId,cursor);
        const sources = statusesToSources(statuses,network);


        const classifications = classifySources(sources,CLASSIFIERS);
        const cIds : string[] = [];
        const errors : {
            statusId:string,
            classificationId:string,
            error:any
        }[] = [];
        //loop through, update each status with classifications
        Object.keys(classifications).forEach(async (statusId:string) => {
            const classificationids = classifications[statusId];

            if( classificationids.length ){
                classificationids.forEach(async (classificationId:string) => {
                    const status = statuses.find(status => status.id === statusId);
                    if( ! status ){
                        return;
                    }
                    cIds.push(classificationId);
                    try {
                        await api.createClassification({
                            slug:classificationId,
                            subtype: network,
                            itemid: status.key,
                            itemtype: api.itemType
                        });
                    } catch (error) {
                        errors.push({
                            statusId,
                            classificationId,
                            error,
                        });
                    }

                })
            }
        });
        return {
            sCursor,
            complete,
            cIds,
            errors
            //sources
        };

    }
}




export class StatusDataApi {
    network: string;
    kv: KVNamespace;
    d1: DrizzleD1Database;
    itemType: string;
    constructor(network:string,kv:KVNamespace,d1: DrizzleD1Database ){
        this.network = network;
        this.kv = kv;
        this.d1 = d1;
        this.itemType = ITEM_TYPE_SOCIAL_POST;
    }

    statusKey ({instanceUrl,accountId,statusId}:{
        instanceUrl:string;
        accountId:string;
        statusId:string;
    }): string {
        return makeSocialPostKey({
            network:this.network,
            instanceUrl: instanceUrl,
            id: statusId,
            accountId,
        });
    }
    async getSavedStatus({instanceUrl,accountId,statusId}:{
        instanceUrl:string;
        accountId:string;
        statusId:string;
    }): Promise<{
        status: SAVED_STATUS|null;
        key: string;
        classifications?: string[];
    }>{
        const key = this.statusKey({
            instanceUrl,
            statusId,
            accountId,
        });
        const data = await this.kv.get(key);
        if( !data ){
            return {
                status: null,
                key: key,
            }
        }

        const classifications = await this.d1.select().from(TABLE_classifications)
            .where(
                and(
                    eq(TABLE_classifications.itemtype, this.itemType),
                    eq(TABLE_classifications.itemid, key ),
                    eq(TABLE_classifications.subtype, this.network)

                ),
            ).all();
        return {
            //@ts-ignore
            status: this.prepareStatus(
                JSON.parse(data),
                key
            ),
            key: key,
            //@ts-ignore
            classifications,
        }


    }
    async getSavedSatuses(instanceUrl:string,accountId?:number,cursor?:string): Promise<{
        statuses: SAVED_STATUS[];
        complete: boolean;
        cursor: string|false;
    }>{
        let prefix = makeSourceType({
            network:this.network,
            accountId: accountId ? accountId.toString() : undefined,
            instanceUrl:instanceUrl}
        );
        const keys = await this.kv.list({
            prefix,
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
                        JSON.parse(data),
                        key.name
                    );
                }
            ));


            return  {
                complete: keys.list_complete,
                cursor: keys.list_complete ? false : keys.cursor,
                statuses: statuses.filter( (status:SAVED_STATUS|null) => {
                    return status !== null;
                }) as Status[],
            };
    }

    private prepareStatus(status: Status,key:string): SAVED_STATUS {
        return {
            key,
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

    async deleteAllStatuses(instanceUrl:string,accountId?:string): Promise<void> {
        let prefix : string;
        if( accountId ){
            prefix = makeSocialPostKey({
                network:this.network,
                instanceUrl: instanceUrl,
                id: '',
                accountId,
            });
        }else{
            prefix = makeSourceType({network:this.network,instanceUrl,accountId});
        }
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
        const key = makeSocialPostKey({
            network:this.network,
            instanceUrl,
            id: status.id,
            accountId,
        });
        await this.kv.put(
            key,
            JSON.stringify(this.prepareStatus(status,key)),
            {
                metadata
            }

        );
        if( classificationids ){
            await this.saveClassifications({
                key,
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

    async getClassifications(offset?:number,limit?:number,) {
        try {
            const classifications = await this.d1.select()
                .from(TABLE_classifications)
                .limit(limit ?? 100)
                .offset(offset??0)
                .all();
            return classifications;
        } catch (error) {
            console.error('Error fetching classifications:', error);
            throw error;
        }
    }

    async getClassificationsForNetwork(network:string,offset?:number,limit?:number,) {
        try {
            const classifications = await this.d1.select()
                .from(TABLE_classifications)
                .where(
                    eq(TABLE_classifications.subtype, network)
                )
                .limit(limit ?? 100)
                .offset(offset??0)
                .all();
            return classifications;
        } catch (error) {
            console.error('Error fetching classifications:', error);
            throw error;
        }
    }

    async getOrCreateClassification(classification:INSERT_CLASSIFICATION): Promise<SAVED_CLASSIFICATION> {
        const existing = await this.d1.select().from(TABLE_classifications)
            .where(
                and(
                    eq(TABLE_classifications.slug, classification.slug),
                    eq(TABLE_classifications.itemid, classification.itemid),
                    eq(TABLE_classifications.itemtype, this.itemType),
                    eq(TABLE_classifications.subtype, this.network ),
                ),
        )

        .limit(1);
        if( existing.length > 0 ){
            return existing[0];
        }
        await this.createClassification(classification);
        return await this.getOrCreateClassification(classification);
    }

    async getWithClassiffication({
        classification,
    }: {
        classification: string;
    }): Promise<{
        statuses: Status[];
    }> {
        const classifications = await this.d1.select().from(TABLE_classifications)
            .where(
                and(
                    eq(TABLE_classifications.slug, classification),
                    eq(TABLE_classifications.itemtype, this.itemType),
                    eq(TABLE_classifications.subtype, this.network ),
                ),
        );
        if( ! classifications.length ){
            return {
                statuses: [],
            }
        }
        const keys = classifications.map((classification:SAVED_CLASSIFICATION) => classification.itemid);
        const statuses : Status[] = [];
        for( const key of keys ){
            const data = await this.kv.get(key);
            if( data ){
                statuses.push(this.prepareStatus(
                    JSON.parse(data),
                    key
                ))
            }
        }
        return {
            statuses
        };
    }


    /**
     *
     * @param key ID of status to save for
     * @param classifications Array of classification slugs to save
     * @param subtype Optional. Use for subtype of classification if passed
     */
    async saveClassifications ({
        key,
        classifications,
        subtype,
        instanceUrl,
        accountId,
    }:{
        key:string,
        classifications: string[],
        instanceUrl:string;
        accountId:string,
        subtype?:string
    }): Promise<string[]> {
        //subtype must be inCLASSIFICATION_SOURCE_TYPES
        if( subtype  && ! CLASSIFICATION_SOURCE_TYPES.includes(subtype) ){
            throw new Error(`Invalid subtype: ${subtype}`);
        }

        const r : string[] = [];
        classifications.forEach(
            async (slug:string) => {
                const classification = await this.getOrCreateClassification({
                    slug,
                    subtype,
                    itemid: key,
                    itemtype: this.itemType
                });
                if( ! classification ){
                    throw new Error(`Classification not found: ${slug}`);
                }
                if( classification.slug ){
                    r.push(classification.slug);
                }
            }
        );
        return r;

    }

}

import { DrizzleD1Database } from "drizzle-orm/d1";
import { Status } from "./social/types/mastodon";
import { INSERT_CLASSIFICATION, SAVED_CLASSIFICATION, TABLE_classifications } from "./db/schema";
import { eq } from "drizzle-orm";

export const makeSourceType = (network:string) => {
    return `socialpost:${network}`;
}
export const makeSocialPostKey = (network:string, id: string) => {
    return `${makeSourceType(network)}:${id}`;
}

export const makeInjestLastKey = (network:string) => {
    return `meta_socialpost:injest:${network}:lastid`;
}

export type SavedStatusMetaData ={
    itemtype: string;
    itemid: string;
};


export class StatusDataApi {
    network: string;
    kv: KVNamespace;
    d1: DrizzleD1Database;
    constructor(network:string,kv:KVNamespace,d1: DrizzleD1Database ){
        this.network = network;
        this.kv = kv;
        this.d1 = d1;
    }
    async getSavedStatus (id: string): Promise<{
        status: Status|null;
        //classifications: string[];
    }> {
        const data = await this.kv.get(makeSocialPostKey(this.network,id));
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
    async getSavedSatuses(cursor?:string): Promise<{
        statuses: Status[];
        complete: boolean;
        cursor: string|false;
    }>{
        const keys = await this.kv.list({
            prefix: makeSourceType(this.network),
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
    async saveStatus(status:  Status, classificationids?:string[]){
        const metadata: SavedStatusMetaData = {
            itemtype: makeSourceType(this.network),
            itemid: status.id,
        };
        await this.kv.put(
            makeSocialPostKey(this.network,status.id),
            JSON.stringify(this.prepareStatus(status)),
            {
                metadata
            }

        );
        if( classificationids ){
            await this.saveClassifications(status.id,classificationids);
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
    async saveClassifications (statusId:string, classifications: string[],subtype?:string) {
        const {
            status: savedStatus,
            //classifications: savedClassifications,
         } = await this.getSavedStatus(statusId);
        if( ! savedStatus ){
            throw new Error(`Status not found: ${statusId}`);
        }
        classifications.map(
            async (slug:string) => {
                const classification = await this.getOrCreateClassification({
                    slug,
                    subtype,
                    itemid: statusId,
                    itemtype: makeSourceType(this.network),
                });
                return classification.id;
            }
        );

    }

}

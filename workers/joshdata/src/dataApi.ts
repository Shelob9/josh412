import { Status } from "./social/types/mastodon";

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
    classificationids?: string[];
};

export type SavedClassification = {
    id: string;
    itemids: string[];
}

export class StatusDataApi {
    network: string;
    kv: KVNamespace;
    constructor(network:string,kv:KVNamespace ){
        this.network = network;
        this.kv = kv;
    }
    async getSavedStatus (id: string): Promise<{
        status: Status|null;
        classificationids: string[];
    }> {
        const data = await this.kv.get(makeSocialPostKey(this.network,id));
        if( !data ){
            return {
                status: null,
                classificationids: [],
            };
        }


        return {
            classificationids: [],
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
            classificationids
        };
        await this.kv.put(
            makeSocialPostKey(this.network,status.id),
            JSON.stringify(this.prepareStatus(status)),
            {
                metadata
            }

        );
    }


    private makeClassificationKey( classificationId:string){
        return `classification:${classificationId}`;
    }

    async getClassification(classificationId:string): Promise<SavedClassification> {
        const exists = await this.kv.get(this.makeClassificationKey(classificationId));
        let classification : SavedClassification;
        if( !exists ){
            classification = {
                id: classificationId,
                itemids: [],
            };
            await this.kv.put(
                this.makeClassificationKey(classificationId),
                JSON.stringify(classification),
            );
        }else{
            classification = JSON.parse(exists);
        }
        return classification;

    }


    private async saveClassification (classification: SavedClassification) {
        await this.kv.put(
            this.makeClassificationKey(classification.id),
            JSON.stringify(classification),
        );
    }

    private async updateClassification(classificationid:string,statusId:string) {
        const classification = await this.getClassification(classificationid);
        classification.itemids.push(statusId);
        await this.saveClassification(classification);
    }

    async saveClassifications (statusId:string, classifications: string[],parentid?:string) {
        const status = await this.getSavedStatus(statusId);
        if( status ){
            throw new Error(`Status ${statusId} does not exist`);
        }
        classifications.forEach( async (classificationid:string) => {
            await this.updateClassification(classificationid,statusId);
        });
        await this.saveStatus(status,classifications);

    }

}

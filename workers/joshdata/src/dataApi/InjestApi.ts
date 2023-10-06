import { makeInjestLastKey } from "src/kvUtil";

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
    async reset(accountId:string) {
        await this.kv.delete(makeInjestLastKey({
            network:this.network,
            instanceUrl:this.instanceUrl,
            accountId
        }));

    }
    async getLastId(accountId:string): Promise<string|false|null> {
        const lastId = await this.kv.get(this.injestKey(accountId));
        console.log({lastId});
        if( SocialInjestTrack.DONE_FLAG === lastId ){
            return false;
        }
        return lastId;
    }

    injestKey(accountId:string): string {
        return makeInjestLastKey({
            network:this.network,
            instanceUrl:this.instanceUrl,
            accountId
        });
    }

    async storeLastId(accountId:string,newValue: string|number) {
        if( 'number' === typeof newValue ){
            newValue = newValue.toString();
        }
        await this.kv.put(this.injestKey(accountId),newValue);
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

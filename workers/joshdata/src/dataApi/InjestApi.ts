import { DataService } from "src/dataApi";
import { makeInjestLastKey,makeInjestLastIdListKey } from "src/kvUtil";
import { Injest_Message } from "src/types";

export class InjestQueueApi {

    DATA: DataService;
    constructor(data: DataService){
        this.DATA = data;

    }
    async send(message: Injest_Message) {
        await this.DATA.INJEST_QUEUE.send(message);
    }

    async consume(message: Injest_Message) {
        switch (message.stage) {
            case 'save':
                switch (message.type) {
                    case 'social_post':
                        const  {
                            done,
                        } = await this.DATA.injestSocialPosts({
                            network: message.network,
                            instanceUrl: message.instanceUrl,
                            accountId: parseInt(message.accountId,10),
                        });
                        if( ! done ){
                            await this.send({
                                direction:message.direction,
                                network:message.network,
                                instanceUrl:message.instanceUrl,
                                accountId:message.accountId,
                                type:message.type,
                                stage:message.stage,
                            });
                        }
                        break;
                    case 'social_post_image':


                    default:
                        break;
                }


                break;
            case 'classify':
                if( 'social_post' === message.type ){
                    const {
                        complete,
                    } = await this.DATA.classifySocialPosts({
                        network: message.network,
                        instanceUrl: message.instanceUrl,
                        accountId: parseInt(message.accountId,10),
                    });
                    if( ! complete ){
                        await this.send({
                            direction:message.direction,
                            network:message.network,
                            instanceUrl:message.instanceUrl,
                            accountId:message.accountId,
                            type:message.type,
                            stage:message.stage,
                        });
                    }
                }


            default:
                break;
        }
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
    async reset(accountId:string) {
        await this.kv.delete(makeInjestLastKey({
            network:this.network,
            instanceUrl:this.instanceUrl,
            accountId
        }));
        //delete log
        await this.kv.delete(makeInjestLastIdListKey({
            network:this.network,
            instanceUrl:this.instanceUrl,
            accountId
        }));

    }
    async getLastId(accountId:string): Promise<string|false|null> {
        const lastId = await this.kv.get(this.injestKey(accountId));
        if( SocialInjestTrack.DONE_FLAG === lastId ){
            return false;
        }
        return lastId;
    }

    private async getLastIdList(): Promise<string[]> {
        const listKey = makeInjestLastIdListKey({
            network:this.network,
            instanceUrl:this.instanceUrl,
            accountId:undefined
        });
        // @ts-ignore
        let lastIds : string[] = await this.kv.get(listKey) || [];
        if( ! lastIds ){
            lastIds  = [];
        }
        return lastIds;
    }

    private async recordLastId(accountId:string,lastId:string ) {

        if( SocialInjestTrack.DONE_FLAG !== lastId ){
            //get the list of lastIds
            const lastIds = await this.getLastIdList();
            //add the lastId to the list
            lastIds.push(lastId);
        }

        await this.kv.put(this.injestKey(accountId),lastId);

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
        await this.recordLastId(accountId,newValue);
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

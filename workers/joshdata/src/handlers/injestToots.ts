import { classifySources } from "../classify"
import { Status, getAccount, getStatuses } from "../social/mastodon";

export const classifyToots = () => {

}

//@todo move to dataApi?
export const makeSocialPostKey = (network:string, id: string) => {
    return `socialpost:${network}:${id}`;
}

export const makeInjestLastKey = (network:string) => {
    return `meta_socialpost:${network}:lastid`;
}

export const injestToots = async ({kv,instanceUrl,username}: {
    kv: KVNamespace,
    instanceUrl: string,
    username: string,
}) => {
    const network = 'mastodon';
    const getLastId = async () : Promise<string|false> => {
        const lastId = await kv.get(makeInjestLastKey(network));
        if( 'done' === lastId ){
            return false;
        }
        return lastId ? lastId : '0';
    }

    const storeLastId = async (newValue: string) => {
        await kv.put(makeInjestLastKey(network),newValue);
    }


    async function processStatus (toot: {
        id: number;
        created_at: string;
        content: string;
    }){
        await kv.put(makeSocialPostKey(network,toot.id.toString()),JSON.stringify(toot));
    }
    let done = false;
    const lastId = await getLastId();
        if( false == lastId ){
            return {
                lastId: 0,
                newLastId: lastId,
                done,
            }
        }
        const account = await getAccount(instanceUrl,username);
        const statuses = await getStatuses(instanceUrl,account.id,lastId ? parseInt(lastId,10) : undefined);
        const newLastId = statuses[statuses.length - 1].id.toString() as number;
        statuses.map(
            async (status:Status) => {
                await processStatus(status);
            }
        )
        if( newLastId ){
            await storeLastId(newLastId);

        }else{
            //mark done
            await kv.put('socialpost:mastodon:laststatusid','done');
            done = true;
        }
        return {
            lastId,
            newLastId,
            done,
        }

}

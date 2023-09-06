import { getAccount, getStatuses } from "./social/mastodon";
import { Status } from "./social/types/mastodon";

//@todo move to dataApi?
export const makeSocialPostKey = (network:string, id: string) => {
    return `socialpost:${network}:${id}`;
}

export const makeInjestLastKey = (network:string) => {
    return `meta_socialpost:${network}:lastid`;
}



interface InjestArgs {
    kv: KVNamespace,
    instanceUrl: string,
    username: string,
    network: string,
}

export async function saveStatuses({
    kv,
    instanceUrl,
    username,
    network,
}: InjestArgs){
    const {
        getLastId,
        storeLastId,
        saveStatus,
        setIsDone,
        isDone,
    } = saveStatusApi(network,kv);
    let done = await isDone();
    const lastId = await getLastId();
    if( done ){
        return {
            lastId,
            newLastId: lastId,
            done,
        }
    }
    const account = await getAccount(instanceUrl,username);
    const statuses = await getStatuses(instanceUrl,account.id,lastId ? parseInt(lastId,10) : undefined);
    // @ts-ignore
    const newLastId = statuses[statuses.length - 1].id.toString() as string;
    statuses.map(
        async (status:Status) => {
            await saveStatus(status);
        }
    )
    if( newLastId ){
        await storeLastId(newLastId);

    }else{
        //mark done
        await setIsDone();
        done = true;

    }
    return {
        lastId,
        newLastId,
        done,
    }
}

export const saveStatusApi = (network:string,kv:KVNamespace )  => {
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

    const saveStatus = async (status:  Status ) => {
        await kv.put(
            makeSocialPostKey(network,status.id),
            JSON.stringify(status)
        );
    }

    const setIsDone = async () => {
        await kv.put(makeInjestLastKey(network),'done');
    }

    const isDone = async () => {
        const lastId = await getLastId();
        return 'done' === lastId;
    }
    return {
        getLastId,
        storeLastId,
        saveStatus,
        setIsDone,
        isDone,
    }
}

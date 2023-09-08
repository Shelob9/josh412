import { CLASSIFIERS,Classifier_Params } from "./classifiers";
import {  Classification_Source,Classification_Matches, classifySources } from "./classify";
import { StatusDataApi, makeInjestLastKey } from "./dataApi";
import { getAccount, getStatuses } from "./social/mastodon";
import { Status } from "./social/types/mastodon";




interface InjestArgs {
    kv: KVNamespace,
    instanceUrl: string,
    username: string,
    network: string,
}



export  const classifyStatuses = async (
    statuses: Status[],
    kv: KVNamespace,
    network: string,
) => {
    const dataApi = new StatusDataApi(network,kv);

    const sources : Classification_Source[] = statuses.map(
        ({id,content}:Status) => {
            return {
                id,
                text:content,
                sourcetype: network,
            }
        }
    );

    const results = classifySources(sources,CLASSIFIERS);

    //loop through results
    Object.keys(results).forEach(
        (async (sourceid:string) => {
            const matches : string[] =  results[sourceid];

        }
    ));
}

export async function saveStatuses({
    kv,
    instanceUrl,
    username,
    network,
}: InjestArgs): Promise<{
    lastId: string|false|null,
    newLastId: string,
    done: boolean,
}>{
    const api = new StatusDataApi(network,kv);

    const getLastId = async () : Promise<string|false|null> => {
        const lastId = await kv.get(makeInjestLastKey(network));
        if( 'done' === lastId ){
            return false;
        }
        return lastId ? lastId : null;
    }

    const storeLastId = async (newValue: string) => {
        await kv.put(makeInjestLastKey(network),newValue);
    }


    const setIsDone = async () => {
        await kv.put(makeInjestLastKey(network),'done');
    }

    const isDone = async () => {
        const lastId = await getLastId();
        return 'done' === lastId;
    }
    let done = await isDone();
    const lastId = await getLastId();
    if( done ){
        return {
            lastId,
            newLastId: lastId ? lastId : '',
            done,
        }
    }
    const accountId = 425078;
    const statuses = await getStatuses(instanceUrl,accountId,lastId ? lastId : undefined);

    const newLastId = statuses[statuses.length - 1].id.toString() as string;
    statuses.map(
        async (status:Status) => {
            await api.saveStatus(status);
        }
    )
    if( newLastId && newLastId !== lastId ){
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

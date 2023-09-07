import { Classification, Classification_Match, Classification_Source, classifySources } from "./classify";
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

const createClassification = (searches: string[], all: boolean, id: string): Classification => {
    return {
        searches: searches.map(search => {
            return {
                search,
                where: 'contains',
                all: false,
            }
        }),
        all,
        id,
    }
}
const classifications : Classification[] = [
    createClassification([
        'good morning',
        'Good Morning',
        'Good morning',
        'good Morning',
        'gm',
        'GM',
    ],false,'gm'),
    createClassification([
        'Good Night',
        'good night',
        'Good night',
        'good Night',
        'gn',
        'GN',
    ],false,'gn'),
    createClassification([
        'dog',
        'Dog',
        'dogs',
        'Dogs',
    ],false,'dog'),

];

export  const classifyStatuses = async (
    statuses: Status[],
    kv: KVNamespace,
    network: string,
) => {


    const _sources : Classification_Source[] = statuses.map(
        (status:Status) => {
            return {
                id: status.id.toString(),
                text: status.content,
                sourcetype: network,
            }
        }
    );
    const sources : Classification_Source[] = [
        {
            id: 'gmhtml',
            text: '<p>Good Morning</p>',
            sourcetype: network,
        },
        {
            id: 'gmnohtml',
            text: 'Good Morning',
            sourcetype: network,
        }
    ];


    const results = classifySources(sources,classifications);
    return results;
    return results.map((match:Classification_Match) => {
        return {
            source: match.source.text,
            classifications,
        };
    });
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
    } = saveStatusFunctions(network,kv);
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

export class StatusDataApi {
    network: string;
    kv: KVNamespace;
    constructor(network:string,kv:KVNamespace ){
        this.network = network;
        this.kv = kv;
    }
    async getSavedSatuses(cursor?:string): Promise<{
        statuses: Status[];
        complete: boolean;
        cursor: string|false;
    }>{
        const keys = await this.kv.list({
            prefix: makeSocialPostKey(this.network,''),
            limit: 100,
            cursor,
        });
        const statuses = await Promise.all(
            keys.keys.map(
                async (key:{name:string}) => {
                    const data = await this.kv.get(key.name);
                    //@ts-ignore
                    return JSON.parse(data);
                }
            ));


            return  {
                complete: keys.list_complete,
                cursor: keys.list_complete ? false : keys.cursor,
                statuses,
            };
    }
    async saveStatus(status:  Status ){
        await this.kv.put(
            makeSocialPostKey(this.network,status.id),
            JSON.stringify(status)
        );
    }

}
export const saveStatusFunctions = (network:string,kv:KVNamespace )  => {
    const api = new StatusDataApi(network,kv);

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
        saveStatus: api.saveStatus,
        setIsDone,
        isDone,
    }
}

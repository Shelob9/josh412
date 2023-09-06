import { json } from "drizzle-orm/mysql-core";
import { saveStatuses, saveStatusFunctions, StatusDataApi } from "../injest";
import { jsonReponse } from "../responseFactory";
const network = 'mastodon';


export const classifyToots = () => {

}

//@todo move to dataApi?
export const makeSocialPostKey = (network:string, id: string) => {
    return `socialpost:${network}:${id}`;
}

export const makeInjestLastKey = (network:string) => {
    return `meta_socialpost:${network}:lastid`;
}

export const getToots = async ({kv,cursor}: {
    kv: KVNamespace,
    cursor?:string,
}): Promise<Response> => {
    const api = new StatusDataApi(network,kv);
    const statuses = await api.getSavedSatuses(cursor);
    return jsonReponse(statuses,200);


}

export const injestToots = async ({kv,instanceUrl,username,stage}: {
    kv: KVNamespace,
    instanceUrl: string,
    username: string,
    stage: 'save'|'classify',
}): Promise<Response> => {

    switch (stage) {
        case 'save':
            const  {
                lastId,
                newLastId,
                done,
            } = await saveStatuses({
                kv,
                instanceUrl,
                username,
                network
            });
            return jsonReponse({
                lastId,
                newLastId,
                done,
            },200);
            break;

        default:
            return jsonReponse({
                4:42
            },200);
            break;
            break;
    }

}

import { jsonReponse } from "../responseFactory";
import { saveStatuses } from "../injest";


export const classifyToots = () => {

}

//@todo move to dataApi?
export const makeSocialPostKey = (network:string, id: string) => {
    return `socialpost:${network}:${id}`;
}

export const makeInjestLastKey = (network:string) => {
    return `meta_socialpost:${network}:lastid`;
}

export const injestToots = async ({kv,instanceUrl,username,stage}: {
    kv: KVNamespace,
    instanceUrl: string,
    username: string,
    stage: 'save'|'classify',
}) => {
    const network = 'mastodon';
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

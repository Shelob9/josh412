import { classifyStatuses, saveStatuses, StatusDataApi } from "../injest";
import { jsonReponse } from "../responseFactory";
import { createHandler, handlerInputArgs } from "./createHandler";
import { Env } from "../env";
const network = 'mastodon';


export const getToots = async ({env,req}: handlerInputArgs): Promise<Response> => {

    return createHandler(env,req,async (env: Env, url: URL, request: Request) => {
        const {KV} = env;
        const cursor = url.searchParams.get('cursor') ?? undefined;
        const api = new StatusDataApi(network,KV);
        const statuses = await api.getSavedSatuses(cursor);
        return jsonReponse(statuses,200);
    });

}



export const injestToots = async ({env,req}: handlerInputArgs): Promise<Response> => {

    return createHandler(env,req,async (env: Env, url: URL, request: Request) => {
        const kv = env.KV;
        const instanceUrl = "https://mastodon.social";
        const username = "@josh412";
        const accountId = 425078;
        const stage = url.searchParams.has('classify') ? 'classify': 'save';

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
            const api = new StatusDataApi(network,kv);
            const {statuses} = await api.getSavedSatuses(undefined);
            const results = classifyStatuses(statuses,kv,network);
            return jsonReponse({
                results
            },200);
            break;
            break;
    }

})};

import { createHandler, handlerInputArgs } from "./createHandler";
import { Env } from "../env";
import { DataService, StatusDataApi } from "../dataApi";
import { jsonReponse } from "../responseFactory";
import { Classification_Source, classifySources } from "../classify";
import { Status } from "../social/types/mastodon";
import { CLASSIFIERS } from "../classifiers";
const network = 'mastodon';

const instanceUrl = "https://mastodon.social";
const username = "@josh412";
const accountId = 425078;


export const getToots = async ({env,req}: handlerInputArgs): Promise<Response> => {
    return createHandler(env,req,async (data,url,req) => {
        const cursor = url.searchParams.get('cursor') ?? undefined;
        const api = await data.getStatusApi(network);
        const statuses = await api.getSavedSatuses(instanceUrl,cursor);
        return jsonReponse(statuses,200);
    });
}



export const injestToots = async ({env,req}: handlerInputArgs): Promise<Response> => {

    return createHandler(env,req,async (data,url,req) =>  {

        const stage = url.searchParams.has('classify') ? 'classify': 'save';
        const cursor = url.searchParams.get('cursor') ?? undefined;
        switch (stage) {
            case 'save':
                const  {
                    lastId,
                    done,
                } = await data.injestSocialPosts({
                    network,
                    instanceUrl,
                    accountId
                });
                return jsonReponse({
                    lastId,
                    done,
                },200);
                break;

        default:
            const api = await data.getStatusApi(network);
            const {statuses,cursor:sCursor,complete} = await api.getSavedSatuses(instanceUrl,cursor);
            const sources : Classification_Source[] = statuses.map(
                ({id,content}:Status) => {
                    return {
                        id,
                        text:content,
                        sourcetype: network,
                    }
                }
            );

            const {classifications} = classifySources(sources,CLASSIFIERS);
                //@todo SAVE the classifications
            return jsonReponse({
                cursor,
                sCursor,
                complete,
                classifications
            },200);
            break;
            break;
    }

})};

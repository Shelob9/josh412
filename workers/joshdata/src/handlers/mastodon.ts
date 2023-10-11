import { createHandler, handlerInputArgs } from "./createHandler";
import { Env } from "../env";
import { DataService, SAVED_STATUS, StatusDataApi } from "../dataApi";
import { jsonReponse } from "../responseFactory";
import { Classification_Source, classifySources } from "../classify";
import { CLASSIFIERS, CLASSIFIER_GM } from "../classifiers";
import { SAVED_CLASSIFICATION } from "src/db/schema";
import { InjestQueueApi } from "src/dataApi/InjestApi";
const network = 'mastodon';

const instanceUrl = "https://mastodon.social";
const accountId = 425078;

const statusToSource = (status: SAVED_STATUS, network: string): Classification_Source => {
    const { id, content } = status;
    return {
        id,
        text: content,
        sourcetype: network,
    };
};

const statusesToSources = (statuses: SAVED_STATUS[], network: string): Classification_Source[] => {
    return statuses.map((status:SAVED_STATUS) => statusToSource(status, network));
};

export const allMastodonClassifications = async ({env,req}: handlerInputArgs): Promise<Response> => {
    return createHandler(env,req,async (data,url,req) => {
        const dataApi = await data.getStatusApi('mastodon');
        const classifications = await dataApi.getClassifications();
        return jsonReponse({
            classifications
        },200);

    });
}

export const getToot = async ({env,req}: handlerInputArgs): Promise<Response> => {
    return createHandler(env,req,async (data,url,req) => {
        //get last segment of url
        const statusId = url.pathname.split('/').pop() as string;

        if( ! statusId ) {
            return jsonReponse({
                error:'no id',
            },400);
        }
        const api = await data.getStatusApi(network);

        const {status,key,classifications} = await api.getSavedStatus({
            instanceUrl,
            statusId,
            accountId: accountId.toString(),
        });
        if( ! status ) {
            return jsonReponse({
                error:'no status',
            },404);
        }

        return jsonReponse({
            statusId,
            status,
            key,
            classifications,
        },status ? 200 : 404);
    });

}

export const deleteToots = async ({env,req}: handlerInputArgs): Promise<Response> => {
    return createHandler(env,req,async (data,url,req) => {

        const api = await data.getStatusApi(network);
        await api.deleteAllStatuses(instanceUrl);
        return jsonReponse({
            deleted:true,
        },200);
    });
}
export const getToots = async ({env,req}: handlerInputArgs): Promise<Response> => {

    return createHandler(env,req,async (data,url,req) => {
        const cursor = url.searchParams.get('cursor') ?? undefined;
        const api = await data.getStatusApi(network);
        const {statuses,complete,cursor:sCursor} = await api.getSavedSatuses(instanceUrl,cursor);

        return jsonReponse({
            cursor,
            sCursor,
            complete,
            next:sCursor ? `http://${url.host}/api/mastodon?cursor=${sCursor}` : false,
            statuses,
        },200);
    });
}



export const injestToots = async ({env,req}: handlerInputArgs): Promise<Response> => {

    return createHandler(env,req,async (data,url,req) =>  {

        const stage = url.searchParams.has('classify') ? 'classify': 'save';
        const cursor = url.searchParams.get('cursor') ?? undefined;
        const injestQueue = await data.getInjestQueueApi();

        switch (stage) {
            case 'save':
                const  {
                    lastId,
                    newLastId,
                    injestKey,
                    done,
                    statuses:toots,
                } = await data.injestSocialPosts({
                    network,
                    instanceUrl,
                    accountId,
                    //resetFirst: url.searchParams.has('reset') && url.searchParams.get('reset') ? true :false,
                });
                if( done ) {
                    //start classifying
                    injestQueue.send({
                        direction: 'backwards',
                        network,
                        instanceUrl,
                        accountId: accountId.toString(),
                        type: 'social_post',
                        stage: 'classify',
                    });
                }else{
                    injestQueue.send({
                        direction: 'backwards',
                        network,
                        instanceUrl,
                        accountId: accountId.toString(),
                        type: 'social_post',
                        stage: 'classify',
                    });
                }


                return jsonReponse({
                    lastId,
                    newLastId,
                    injestKey,
                    done,
                    stage,
                    toots
                },200);
                break;

        default:
            const {
                sCursor,
                complete,
                cIds
            } = await data.classifySocialPosts({
                network,
                instanceUrl,
                accountId,
            });
            if( ! complete ) {
                injestQueue.send({
                    direction: 'backwards',
                    network,
                    instanceUrl,
                    accountId: accountId.toString(),
                    type: 'social_post',
                    stage: 'classify',
                });
            }
            return jsonReponse({
                cursor,
                sCursor,
                complete,
                cIds,
                //sources
            },200);
            break;
    }

})};

import { createHandler, handlerInputArgs } from "./createHandler";
import { Env } from "../env";
import { DataService, StatusDataApi } from "../dataApi";
import { jsonReponse } from "../responseFactory";
import { Classification_Source, classifySources } from "../classify";
import { Status } from "../social/types/mastodon";
import { CLASSIFIERS } from "../classifiers";
import { json } from "drizzle-orm/mysql-core";
const network = 'mastodon';

const instanceUrl = "https://mastodon.social";
const accountId = 425078;

type ResponseStatus = {
    id:string,
    content:string,
    url?:string|null,
    created_at:string,
    id_reply_to_id?:string|null,
    id_reply_to_account_id?:string|null,
    replies_count:number,
    reblogs_count:number,
    media_attachments: any[],
    mentions: any[],
    account: {
        id:string,
        username:string,
        display_name:string,
        url:string,
    },
    reblog?:ResponseStatus
};

export const getStatus = async ({env,req}: handlerInputArgs): Promise<Response> => {
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
        return jsonReponse({
            statusId,
            status,
            key,
            classifications
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
        switch (stage) {
            case 'save':
                const  {
                    lastId,
                    done,
                    statuses:toots,
                } = await data.injestSocialPosts({
                    network,
                    instanceUrl,
                    accountId,
                    stopAfter:1
                });
                return jsonReponse({
                    lastId,
                    done,
                    stage,
                    toots
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


            const classifications = classifySources(sources,CLASSIFIERS);

            let insertedIds : number[] = [];
            //loop through, update each status with classifications
            Object.keys(classifications).forEach(async (statusId:string) => {
                const classificationids = classifications[statusId];

                const r = await api.saveClassifications({
                    key: api.statusKey({statusId,instanceUrl,accountId:accountId.toString()}),
                    classifications:classificationids,
                    subtype:network,
                    instanceUrl,
                    accountId: accountId.toString(),
                });
                if( r ){
                    insertedIds = insertedIds.concat(r);
                }
            });
            return jsonReponse({
                cursor,
                sCursor,
                complete,
                classifications,
                stage,
                insertedIds
                //sources
            },200);
            break;
    }

})};

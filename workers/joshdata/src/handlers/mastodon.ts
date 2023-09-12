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
const username = "@josh412";
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
        const {status,key} = await api.getSavedSatus({
            instanceUrl,
            statusId,
            accountId: accountId.toString(),
        });
        return jsonReponse({
            statusId,
            status,
            key,
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
    const prepareStatus = (status:Status) : ResponseStatus => {
        return {
            id:status.id,
            content:status.content,
            url:status.url,
            created_at:status.created_at,
            id_reply_to_id:status.in_reply_to_id,
            id_reply_to_account_id:status.in_reply_to_account_id,
            replies_count:status.replies_count,
            reblogs_count:status.reblogs_count,
            media_attachments: status.media_attachments ?? [ ],
            mentions: status.mentions ?? [ ],
            account: {
                id:status.account.id,
                username:status.account.username,
                display_name:status.account.display_name,
                url:status.account.url,
            },
            reblog: status.reblog ? prepareStatus(status.reblog) : undefined,
        }
    }
    return createHandler(env,req,async (data,url,req) => {
        const cursor = url.searchParams.get('cursor') ?? undefined;
        const api = await data.getStatusApi(network);
        const {statuses,complete,cursor:sCursor} = await api.getSavedSatuses(instanceUrl,cursor);
        const returnData = statuses.map(
            (status:Status) => prepareStatus(status)
        );
        return jsonReponse({
            cursor,
            sCursor,
            complete,
            next:sCursor ? `http://${url.host}/api/mastodon?cursor=${sCursor}` : false,
            statuses: returnData,
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

                console.log({sources})
            const classifications = classifySources(sources,CLASSIFIERS);
            //loop through, update each status with classifications
            Object.keys(classifications).forEach(async (statusId:string) => {
                const classificationids = classifications[statusId];
                await api.saveClassifications({
                    statusId,
                    classifications:classificationids,
                    subtype:network,
                    instanceUrl,
                    accountId: accountId.toString(),
                });
            });
            return jsonReponse({
                cursor,
                sCursor,
                complete,
                classifications,
                stage,
                //sources
            },200);
            break;
    }

})};

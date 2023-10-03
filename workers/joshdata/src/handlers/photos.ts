import { createHandler, handlerInputArgs } from "./createHandler";
import { Env } from "../env";
import { DataService, SAVED_STATUS, StatusDataApi } from "../dataApi";
import { jsonReponse } from "src/responseFactory";
import { MediaAttachment, Status } from "@social";
import {putMediaItem} from "@media/functions";
//get all social_post items that are gm
//get the images from each
// create a photo/gm item for each
// upload image to cdn for each photo/gm item
// save photo/gm item to db

const network = 'mastodon';
const instanceUrl = "https://mastodon.social";


export const collectPhotos = async ({env,req}: handlerInputArgs): Promise<Response> => {
    return createHandler(env,req, async (data,url,req) => {
        const {CDN_BUCKET} = env;
        const uploadImageFromUrl = async (url:string,) => {
            console.log(`uploading ${url}`);
            const response = await fetch(url);
            if( ! response.ok || ! response.body ) {
                return;
            }
            const newKey = url.split('/').pop() as string;
            await putMediaItem(CDN_BUCKET,newKey,response.body);
        }
        const dataApi = await data.getStatusApi(network);
        const {statuses,cursor,complete} = await dataApi.getSavedSatuses(instanceUrl);
        const collected : Status[] = statuses;
        //get all status
        while( ! complete ) {
            const next = await dataApi.getSavedSatuses(instanceUrl,cursor ? cursor : undefined);
            collected.push(...next.statuses);
        }
        //for each status
        // create a photo/gm item for each
        // upload image to cdn for each photo/gm item
        statuses.forEach(async (status:Status) => {
            if( ! status.media_attachments ) {
                return;
            }
            status.media_attachments.forEach(async (attachment:MediaAttachment) => {
                await uploadImageFromUrl(attachment.url);
            });
        });
        return jsonReponse({
            statuses: collected,
        },200);

    });

}

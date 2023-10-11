import { putMediaItem } from "@media/functions";
import { DataService } from "src/dataApi";
import { ImageAttachment, MediaAttachment, Status } from "../../../../packages/social/src/types/mastodon";

export class PhotosApi {

    DATA: DataService;
    network: string;
    accountId: string;
    instanceUrl: string;

    constructor(data: DataService,network: string,accountId: string,instanceUrl: string){
        this.DATA = data;
        this.network = network;
        this.accountId = accountId;
        this.instanceUrl = instanceUrl;

    }

    private async uploadImageFromUrl(url:string){
        let newKey = url.split('/').pop() as string;
        newKey = `photos/${newKey}`;
        console.log('newKey',newKey);
        console.log(`uploading ${url} to ${newKey}`);
        const response = await fetch(url);
        if( ! response.ok || ! response.body ) {
            console.log('Fetch failed');
            return;
        }

        await putMediaItem(this.DATA.CDN_BUCKET,newKey,response.body);
    }

    async createPhotoPosts({
        classification,
    }: {
        classification: string;
    }){
        const api = await this.DATA.getStatusApi(this.network);
        const mediaApi = await this.DATA.getMediaApi();
        //get all social posts for this classification
        const {statuses} = await api.getWithClassiffication({
            classification,
        });

        //for each status
        statuses.forEach(async (status:Status) => {
            if( ! status.media_attachments ) {
                return;
            }
            status.media_attachments.forEach(async (attachment:MediaAttachment) => {
                await mediaApi.putAttatchment(attachment as ImageAttachment);
            });
        });


    }

}

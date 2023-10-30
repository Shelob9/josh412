import { Attatchment } from ".";
import { ImageAttachment, Status } from "./types/mastodon";

/**
 * Create status
 *
 * @see https://docs.joinmastodon.org/methods/statuses/#create
 * @see https://docs.joinmastodon.org/methods/media/
 */
export async function createMastodonStatus(
    token: string,
    text: string,
    instanceUrl: string,
    visibility: 'public' | 'unlisted' | 'private' | 'direct',
    attachments?: Attatchment[]
): Promise<{
    id: string,
    uri: string,
    url?: string,
}> {
    const data : {
        status: string;
        visibility: string;
        media_ids?: string[];
    } = {
        status: text,
        visibility: visibility,
    };
    if( attachments ){
        const mediaIds = await Promise.all(attachments.map(async (attatchment) => {
            const mediaResponse = await fetch(`${instanceUrl}/api/v1/media`, {
                method: 'POST',
                body: attatchment.file,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': attatchment.encoding
                }
            });
            const mediaData = await mediaResponse.json() as ImageAttachment;
            return mediaData.id;
        }));
        if( mediaIds.length ){
            data.media_ids = mediaIds;
        }
    }
    const statusResponse = await fetch('https://mastodon.social/api/v1/statuses', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    const statusData = await statusResponse.json() as Status;
    return {
        id: statusData.id,
        uri: statusData.uri,
        url: statusData.url,
    }
}

/**
 * Get statuses
 *
 * @see  https://docs.joinmastodon.org/methods/accounts/#statuses
 */
export function getStatuses(
    instancei: string,
    accountId:number,
    maxId?:string,
    sinceId?:string
): Promise<Status[]>{
    let url = `${instanceUrl}/api/v1/accounts/${accountId}/statuses?limit=40`
    if( maxId ){
        url += `&max_id=${maxId}`;
    }else if( sinceId ){
        url += `&since_id=${sinceId}`;
    }
    const statuses = fetch(url).then(res => res.json())
        .catch(err => {
            console.error(err);
            return [];
        });
    //@ts-ignore
    return statuses;
}
/**
 * @see https://docs.joinmastodon.org/methods/statuses/#get
 */
export function getStatus(
    instanceUrl: string,
    id: string
): Promise<Status> {
    const status =  fetch(`${instanceUrl}/api/v1/statuses/${id}`).then(res => res.json());
    //@ts-ignore
    return status;
}

export async function getAccount(instanceUrl: string, username:string): Promise<{
 id: number
}>{
	const account = await fetch(
		`${instanceUrl}api/v1/accounts/lookup?acct=${username}`,
	).then( r => r.json());
    //@ts-ignore
	return account;
}

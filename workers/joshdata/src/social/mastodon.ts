export type Status = {
    id: number;
    type: string;
    url: string;
    content: string;
    created_at: string;
    in_reply_to_account_id: number;
    media_attachments: Media[];
}
export type Media = {
    id: number;
    type: string;
    url: string;
    sensitive: boolean;
    meta: {
        original: {
            width: number,
            height: number,
            size: string,
            aspect: number
        },
        small: {
            width: number,
            height: number,
            size: string,
            aspect: number
        },
    }
    description: string;
    blurhash: string;//"UmHd7fW:AHWpI?ofoJkC13WUxEjYw]bFj=fj"

}
/**
 * Get statuses
 *
 * @see  https://docs.joinmastodon.org/methods/accounts/#statuses
 */
export function getStatuses(
    instanceUrl: string,
    accountId:number,
    maxId?:number,
): Promise<Status[]>{

    const statuses = fetch(`${instanceUrl}/api/v1/accounts/${accountId}/statuses${maxId ? `?max_id=${maxId}` : ''}`).then(res => res.json())
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

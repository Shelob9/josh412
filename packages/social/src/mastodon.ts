import { Status } from "./types/mastodon";

/**
 * Get statuses
 *
 * @see  https://docs.joinmastodon.org/methods/accounts/#statuses
 */
export function getStatuses(
    instanceUrl: string,
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

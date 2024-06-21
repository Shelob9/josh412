import { Attatchment } from "."
import { Account, ImageAttachment, Status } from "./types/mastodon"

export type Mastodon_Api_Pagination = {
    sinceId?: string
    maxId?: string
    minId?: string
    limit?: number
}
//New API class
// @todo refactor existing functions to use this class
// @todo stop exporting all those.
export class MastodonApi {

    instanceUrl: string
    token?: string
    constructor(instanceUrl: string, token?: string) {
        this.instanceUrl = instanceUrl
        this.token = token
    }
    async getAccountById(id: string, instanceUrl?: string) {
        return await getMastodonAccountById(
            instanceUrl ?? this.instanceUrl,
            id
        )
    }
    async getAccount(username: string, instanceUrl?: string) {
        return await getAccount(
            instanceUrl ?? this.instanceUrl,
            username
        )
    }

    async search(q:string, {instanceUrl, following, account_id } : {
        instanceUrl?: string,
        following?: boolean,
        account_id?: string|number
    } = {
    }) {
        const query = new URLSearchParams({
            q,

        })
        if( following ){
            query.set('following',following.toString())
        }
        if( account_id ){
            query.set('account_id',account_id.toString())
        }
        return await fetch(`${instanceUrl ?? this.instanceUrl}/api/v2/search?${query.toString()}`).then((r) => r.json())
    }

    async getStatuses({
        accountId,
        maxId,
        sinceId,
        minId,
        limit,
        excludeReblogs,
    }: {
        accountId: string|number
        excludeReblogs?: boolean
    } & Mastodon_Api_Pagination) {
        return await getStatuses(
            this.instanceUrl,
            accountId,
            maxId,
            sinceId,
            minId,
            limit,
            excludeReblogs
        );

    }

    async getTimeLine({
        sinceId,
        maxId,
        minId,
        limit,
    }: Mastodon_Api_Pagination) {
        return await getMastdonTimeline(this.args({
            sinceId,
            maxId,
            minId,
            limit,
        }))
    }

    private args(args: any) {
        return {
            instanceUrl: this.instanceUrl,
            token: this.token,
            ...args
        }
    }


    async uploadMedia({
        attatchment,
    }: {
        attatchment: Attatchment
    }) {
        return await uploadMediaToMastdon(this.args({
            attatchment,
        }));
    }

    async createStatus({
        text,
        visibility,
        attachments,
        postAt,
    }: {
        text: string
        visibility: "public" | "unlisted" | "private" | "direct"
        attachments?: Attatchment[],
        postAt?: Date
    }) {
        return await createMastodonStatus(this.args({
            text,
            visibility,
            attachments,
            postAt,
        }));
    }

    async getScheduled({
        sinceId,
        maxId,
        minId,
        limit,
    }: {
        sinceId?: string
        maxId?: string
        minId?: string
        limit?: number
    }) {
        return await getScheduled(this.args({
            sinceId,
            maxId,
            minId,
            limit,
        }));
    }

    async updateScheduled({
        id,
        newDate,
    }: {
        id: string
        newDate: Date
    }) {
        return await updateScheduled(this.args({
            id,
            newDate,
        }))

    }

    async cancelScheduled({
        id,
    }: {
        id: string
    }) {
        return await cancelScheduled(this.args({
            id,
        }))
    }


}
/**
 * Create status
 *
 * @see https://docs.joinmastodon.org/methods/statuses/#create
 * @see https://docs.joinmastodon.org/methods/media/
 */
export async function createMastodonStatus({
    token,
    text,
    instanceUrl,
    visibility,
    attachments,
    postAt,
}: {
    token: string
    text: string
    instanceUrl: string
    visibility: "public" | "unlisted" | "private" | "direct"
    attachments?: Attatchment[],
    postAt?: Date
}): Promise<{
    id: string
    uri: string
    url?: string
}> {
    const data: {
        status: string
        visibility: string
        media_ids?: string[]
        scheduled_at?: string
    } = {
        status: text,
        visibility: visibility,
    }
    if (attachments) {
        const mediaIds = await Promise.all(
            attachments.map(async (attatchment) => {
                try {
                    const id = uploadMediaToMastdon({
                        attatchment,
                        instanceUrl,
                        token,
                    })
                    return id;
                } catch (error) {
                    console.log({ error })
                    return false

                }
            })
        )
        if (mediaIds.length) {
            // @ts-ignore
            data.media_ids = mediaIds.filter((id) => id)
        }
    }
    if (postAt) {
        data.scheduled_at = postAt.toISOString()
    }
    console.log({ data });
    const statusResponse = await fetch(
        `${instanceUrl}/api/v1/statuses`,
        {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        }
    )
    const statusData = await statusResponse.json() as Status;
    if (![200, 201].includes(statusResponse.status)) {
        //@ts-ignore
        throw new Error(statusData.error || `Could not post`)
    }
    return {
        id: statusData.id,
        uri: statusData.uri,
        url: statusData.url as string,
    }
}

async function uploadMediaToMastdon({ attatchment, instanceUrl, token }: {
    attatchment: Attatchment,
    instanceUrl: string,
    token: string,
}) {
    const formData = new FormData();
    const file = await attatchment.file.blob()
    formData.set('file', file);
    formData.set('description', attatchment.description);

    const mediaResponse = await fetch(
        `${instanceUrl}/api/v2/media`,
        {
            method: "POST",
            // @ts-ignore
            body: formData,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const mediaData =
        (await mediaResponse.json()) as ImageAttachment
    return mediaData.id
}
/**
 * Get statuses
 *
 * @see  https://docs.joinmastodon.org/methods/accounts/#statuses
 * @todo Include reblogs exclude_reblogs = false
 */
export async function getStatuses(
    instanceUrl: string,
    accountId: number,
    //MAX ID: String. All results returned will be lesser than this ID. In effect, sets an upper bound on results.
    maxId?: string,
    //SINCE ID: String. All results returned will be greater than this ID. In effect, sets a lower bound on results.
    sinceId?: string,
    //MIN ID: String. Returns results immediately newer than this ID. In effect, sets a cursor at this ID and paginates forward.
    minId?: string,
    limit: number = 40,
    //By default reblogs are included. You can exclude reblogs by setting this parameter to true.
    excludeReblogs: boolean = false
): Promise<Status[]> {
    let url = `${instanceUrl}/api/v1/accounts/${accountId}/statuses?limit=${limit}&exclude_reblogs=${excludeReblogs ? 'true' : 'false'}`
    if (maxId) {
        url += `&max_id=${maxId}`
    } else if (sinceId) {
        url += `&since_id=${sinceId}`
    }
    if (minId) {
        url += `&min_id=${minId}`
    }
    console.log({ url });

    const statuses = await fetch(url)
        .then((res) => res.json())
        .catch((err) => {
            console.error(err)
            return []
        })
    // @ts-ignore
    if (statuses.error) {
        // @ts-ignore
        throw new Error(statuses.error)
    }
    //@ts-ignore
    return statuses
}
/**
 * @see https://docs.joinmastodon.org/methods/statuses/#get
 */
export function getMastodonStatus({
    instanceUrl, id
}: {
    instanceUrl: string, id: string
}): Promise<Status> {
    const status = fetch(`${instanceUrl}/api/v1/statuses/${id}`).then((res) =>
        res.json()
    )
    //@ts-ignore
    return status
}
export function ensureUrlEndsWithSlash(url: string) {
    //make sure instanceUrl ends in /
    if (url[url.length - 1] !== "/") {
        url += "/"
    }
    return url
}

/**
 * Get Mastodon account by username
 *
 * @todo rename to getMastodonAccountByUsername
 *
 * @param instanceUrl
 * @param username
 * @returns Account|false
 */
export async function getAccount(
    instanceUrl: string,
    username: string
): Promise<Account | false> {

    const account = await fetch(
        `${ensureUrlEndsWithSlash(instanceUrl)}api/v1/accounts/lookup?acct=${username}`
    ).then((r) => r.json())
    if (!account || account.hasOwnProperty('error')) {
        return false
    }
    return account as Account
}

/**
 * Get Mastodon account by id
 *
 * @param instanceUrl
 * @param id
 *
 */
export async function getMastodonAccountById(
    instanceUrl: string,
    id: string
): Promise<Account | false> {
    const account = await fetch(
        `${ensureUrlEndsWithSlash(instanceUrl)}/api/v1/accounts/${id}`
    ).then((r) => r.json())
    if (!account || account.hasOwnProperty('error')) {
        return false
    }
    return account as Account
}

/**
 *
 * @see https://docs.joinmastodon.org/methods/scheduled_statuses/#get
 * max_id
String. All results returned will be lesser than this ID. In effect, sets an upper bound on results.
since_id
String. All results returned will be greater than this ID. In effect, sets a lower bound on results.
min_id
String. Returns results immediately newer than this ID. In effect, sets a cursor at this ID and paginates forward.
limit
 */
export async function getScheduled({
    token,
    instanceUrl,
    sinceId,
    maxId,
    minId,
    limit,
}: {
    instanceUrl: string
    token: string
    sinceId?: string
    maxId?: string
    minId?: string
    limit?: number

}) {
    const url = new URL(`/api/v1/scheduled_statuses`, instanceUrl);
    const params = new URLSearchParams();
    if (sinceId) {
        params.set('since_id', sinceId);
    }
    if (maxId) {
        params.set('max_id', maxId);
    }
    if (minId) {
        params.set('min_id', minId);
    }
    if (limit) {
        params.set('limit', limit.toString());
    }

    url.search = params.toString();
    const r = fetch(url.toString(), {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })
    const data = await r.then((r) => r.json());
    return data;
}

export async function updateScheduled({
    id,
    token,
    instanceUrl,
    newDate,
}: {
    id: string,
    token: string,
    instanceUrl: string,
    newDate: Date,

}) {
    const url = new URL(`/api/v1/scheduled_statuses/${id}`, instanceUrl);
    return fetch(url.toString(), {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            scheduled_at: newDate.toISOString(),
        })
    }).then((r) => r.json());


}

export async function cancelScheduled({
    id,
    token,
    instanceUrl,
}: {
    id: string,
    token: string,
    instanceUrl: string,

}) {
    const url = new URL(`/api/v1/scheduled_statuses/${id}`, instanceUrl);
    return fetch(url.toString(), {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },

    }).then((r) => r.json());
}

/**
 * @see https://docs.joinmastodon.org/methods/timelines/#home
 * @returns
 */
export async function getMastdonTimeline({
    token,
    instanceUrl,
    sinceId,
    maxId,
    minId,
    limit,
}: {
    instanceUrl: string
    token: string
    sinceId?: string
    maxId?: string
    minId?: string
    limit?: number

}) {
    const url = new URL(`/api/v1/timelines/home`, instanceUrl);
    const params = new URLSearchParams();
    if (sinceId) {
        params.set('since_id', sinceId);
    }
    if (maxId) {
        params.set('max_id', maxId);
    }
    if (minId) {
        params.set('min_id', minId);
    }
    if (limit) {
        params.set('limit', limit.toString());
    }
    if (params.toString().length) {
        url.search = params.toString();
    }
    return fetch(url.toString(), {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },

    }).then((r) => r.json());
}

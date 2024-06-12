import {
    AppBskyActorDefs,
    AppBskyFeedDefs,
    AppBskyFeedPost,
    AtpSessionData,
    AtpSessionEvent,
    BskyAgent,
    RichText
} from "@atproto/api"
import { Attatchments } from "."
import { Status_Link } from "./types/generic"

export async function getBluskyAccount({
    agent,
    username,
}: {
    agent: BskyAgent
    username: string
}) {
    const accountsRes = await agent.searchActors({
        q: username,
        limit: 10
    })
    if (!accountsRes.data || accountsRes.data.actors.length === 0) {
        throw new Error("Account not found")
    }

    const account = accountsRes.data.actors.find((account) => {
        return username === account.handle
    })
    if (!account) {
        throw new Error("Account not found")
    }

    return {
        did: account.did,
        id: account.did,
        handle: account.handle,
        name: account.displayName || '',
        avatar: account.avatar || '',
    }
}
export async function tryBskyLogin({
    service,
    identifier,
    password,
}: {
    service?: string
    identifier: string
    password: string
    //kv?: KVNamespace,
}): Promise<{ id: string; agent: BskyAgent; }> {
    service = service ?? "https://bsky.social"


    const agent = new BskyAgent({
        service: service ?? "https://bsky.social",
        //@ts-ignore
        persistSession: (evt: AtpSessionEvent, sess?: AtpSessionData) => {
            //console.log({digest,evt,sess});
        },
    })
    try {
        const r = await agent.login({
            identifier,
            password,
        })
        const { did } = r.data
        return { id: did, agent, }

    } catch (error) {
        console.log(error)
        throw new Error("Could not login")
    }

}

export async function getBskyLikes({
    agent,
    actor,
    limit,
    cursor,
}: {
    actor: string
    agent: BskyAgent
    limit?: number
    cursor?: string
}) {
    const likes = await agent.getActorLikes({
        actor,
        limit,
        cursor,
    })
    if (!likes.data) {
        throw new Error("no data")
    }

    return {
        likesCursor: likes.data.cursor,
        likes: likes.data.feed,
    }
}
export async function postBsykyStatus({
    text,
    agent,
    attachments,
    langs,
    statusLink
}: {
    text: string
    agent: BskyAgent
    langs?: string[]
    attachments?: Attatchments
    statusLink?: Status_Link
}): Promise<{ uri: string; cid: string }> {
    langs = langs ?? ["en-US"]
    const rt = new RichText({ text })
    await rt.detectFacets(agent)
    const post: Partial<AppBskyFeedPost.Record> & Omit<AppBskyFeedPost.Record, 'createdAt'> = {
        $type: "app.bsky.feed.post",
        text: rt.text,
        facets: rt.facets,
        createdAt: new Date().toISOString(),
        langs,
    }
    if (statusLink && statusLink.url) {
        //const blobRef: BlobRef | undefined = undefined;
        if (statusLink.url) {
            //const blob = await fetch(statusLink.url).then(async (r) => await r.blob())

            //@ts-ignore
            //blobRef = await agent.uploadBlob(blob, { encoding: 'image/jpg' })
        }

        post.embed = {
            $type: 'app.bsky.embed.external',
            external: {
                uri: statusLink.url,
                title: statusLink.title,
                description: statusLink.description,
                // thumb: blobRef ?? undefined,
            }
        }
    }

    if (attachments && attachments.length > 0) {
        const uploads = await Promise.all(
            attachments.map(async ({ file, description, encoding }) => {
                const image = await file.blob()
                //@ts-ignore
                const upload = await agent.uploadBlob(image, { encoding }).catch(
                    (error) => {
                        console.log({ upload: error })
                        throw new Error(`Could not upload ${description}`)
                    }
                )
                return {
                    image: upload.data.blob,
                    alt: description,
                }
            })
        )
        if (uploads.length > 0) {
            post.embed = {
                images: uploads.map(({ image, alt }) => {
                    return {
                        image,
                        alt,
                    }
                }),
                $type: "app.bsky.embed.images",
            };
        }
    }
    try {
        const results = await agent.post(post)
        return {
            uri: results.uri,
            cid: results.cid,
        }
    } catch (error) {
        console.log(error)
        throw new Error(`Could not post`)
    }

}

export async function getBlueskyStatuses({
    agent,
    actor,
    limit,
    cursor,
}: {
    //Best to use a did
    actor: string
    agent: BskyAgent
    limit?: number
    cursor?: string
}): Promise<{
    statusesCursor: string | undefined;
    statuses: AppBskyFeedDefs.FeedViewPost[];
}> {
    // https://www.docs.bsky.app/docs/tutorials/viewing-feeds#author-feeds
    const filter = 'posts_with_replies';
    const { data } = await agent.getAuthorFeed({
        actor,
        filter,
        limit,
        cursor,
    });

    if (!data) {
        throw new Error("no data")
    }

    return {
        statusesCursor: data.cursor,
        statuses: data.feed,
    }
}

export async function getBlueskyStatus({
    agent,
    actor,
    did,
}: {
    //Best to use a did
    actor: string
    agent: BskyAgent
    did: string
}): Promise<{
    statusesCursor: string | undefined;
    statuses: AppBskyFeedDefs.FeedViewPost[];
}> {
    // https://www.docs.bsky.app/docs/tutorials/viewing-feeds#author-feeds
    const filter = 'posts_with_replies';
    const { data } = await agent.getAuthorFeed({
        actor,
        filter,
        limit: 1,
        cursor: did,
    });

    if (!data) {
        throw new Error("no data")
    }

    return {
        statusesCursor: data.cursor,
        statuses: data.feed,
    }
}

/**
 * @see https://www.docs.bsky.app/docs/tutorials/viewing-profiles#fetching-a-users-profile-info
 */
export async function getBlueskyUser({
    agent,
    actor,
}: {
    actor: string
    agent: BskyAgent
}): Promise<AppBskyActorDefs.ProfileViewDetailed> {
    const user = await agent.getProfile({
        actor,
    })
    if (!user.data) {
        throw new Error("no data")
    }
    console.log({ user: user.data });
    return user.data;
};

/**
 * @ see https://www.docs.bsky.app/docs/tutorials/viewing-profiles#fetching-multiple-profiles-at-once
 */
export async function getBlueskyUsers({
    agent,
    actors,
}: {
    actors: string[]
    agent: BskyAgent
}): Promise<AppBskyActorDefs.ProfileViewDetailed[]> {
    const users = await agent.getProfiles({
        actors,
    })
    if (!users.data) {
        throw new Error("no data")
    }
    // @ts-ignore
    return users.data;
}


export async function getBlueskyTimeline({ agent, cursor, limit }: {
    agent: BskyAgent
    cursor?: string
    limit?: number
}): Promise<{
    cursor: string | undefined
    posts: AppBskyFeedDefs.FeedViewPost[]
}> {
    const { data } = await agent.getTimeline({
        cursor,
        limit,
    })
    if (!data) {
        throw new Error("no data")
    }

    return {
        cursor: data.cursor,
        posts: data.feed,
    }
}

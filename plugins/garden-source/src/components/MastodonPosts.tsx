import React from 'react';
import Images from './Images';

type MastodonMedia = {
    id: string,
    type: string,
    url: string,
    preview_url: string,
    remote_url: string | null,
    preview_remote_url: string | null,
    text_url: string | null,
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
        }
    },
    description: string,
    blurhash: string
};
type MastodonStatus = {
    id: string,
    created_at: string,
    in_reply_to_id: string | null,
    in_reply_to_account_id: string | null,
    sensitive: boolean,
    spoiler_text: string,
    visibility: string,
    language: string,
    uri: string,
    url: string,
    replies_count: number,
    reblogs_count: number,
    favourites_count: number,
    edited_at: string,
    content: string,
    reblog: any | null,
    application: {
        name: string,
        website: string
    },
    account: {
        id: string,
        username: string,
        acct: string,
        display_name: string,
        locked: boolean,
        bot: boolean,
        discoverable: boolean,
        indexable: boolean,
        group: boolean,
        created_at: string,
        note: string,
        url: string,
        uri: string,
        avatar: string
    },
    media_attachments?: MastodonMedia[]
};

function MastodonPost({post}:{
    post: MastodonStatus
}){
    const images = post.media_attachments ?  post.media_attachments.map((media) => {
        return {
            key: media.id,
            src: media.url,
            alt: media.description,
        }
    } ) : [];
    return (
        <div >
            <h3><a href={post.account.url} target="_blank">{post.account.display_name}</a></h3>
            <p dangerouslySetInnerHTML={{ __html: post.content }} />
            {post.media_attachments && (
                <Images images={images} />
            )}
            <a href={post.url} target="_blank">View</a>
        </div>
    )
}
export default function MastodonPosts({
    posts,
}: {
    posts: MastodonStatus[]
}) {
    return (
        <div>
            {posts.map((post) => <MastodonPost key={post.id} post={post} />)}
        </div>
    );
}

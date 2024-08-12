import React from 'react';
import { UseProps } from './Timeline';
import TimelinePost from './TimelinePost';



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

export default function MastodonPosts({
    posts,
    onCopy,
    onQuote
}: {
    posts: MastodonStatus[]
}&UseProps) {

    return (
        <>
            {posts.map((post) => (
                <TimelinePost
                    key={post.id}
                    postUrl={post.url}
                    onCopy={onCopy }
                    onQuote={onQuote }
                    content={post.content}
                    postAuthor={{
                        url: post.account.url,
                        displayName: post.account.display_name,
                        avatar: post.account.avatar
                    }}
                    reply={post.reblog ? {
                        url: post.reblog.url
                    } : undefined}
                    medias={post.media_attachments?.map((media) => ({
                        id: media.id,
                        preview_url: media.preview_url,
                        url: media.url,
                        description: media.description
                    }))}
                    />

            ))}

        </>
    );
}

import {
    Button,
    Flex,
    FlexItem,
    __experimentalHStack as HStack,
    __experimentalVStack as VStack
} from '@wordpress/components';
import React from 'react';
import { PostAuthor } from './Posts';
import { UseProps } from './Timeline';



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
            {posts.map((post) => {
                return (
                    <VStack
                        key={post.id}

                    >
                        <PostAuthor url={post.account.url} displayName={post.account.display_name} avatar={post.account.avatar}  />
                        <div dangerouslySetInnerHTML={
                            { __html: post.content }
                        }/>
                        <FlexItem>
                            {post.media_attachments && (
                                <Flex>
                                    {post.media_attachments.map((media) => {
                                        return (
                                            <FlexItem key={media.id}>
                                                <img src={media.preview_url} alt={media.description} />
                                            </FlexItem>
                                        )
                                    })}
                                </Flex>
                            )}
                        </FlexItem>

                        <HStack>
                            <a href={post.url} target="_blank">View</a>

                            <Button  onClick={() => onCopy(post.content)}>Copy</Button>
                            <Button
                                onClick={() => onQuote(post.content,`<a href="${post.account.url}">${post.account.display_name}</a>`)}
                                >Quote</Button>
                        </HStack>

                    </VStack>
                )
            })}
        </>
    );
}

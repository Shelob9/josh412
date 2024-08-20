import {
    ButtonGroup,
    __experimentalGrid as Grid,
    SelectControl,
    Spinner,
} from '@wordpress/components';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from 'react-daisyui';
import { accountOptions, accounts } from '../accounts';
import { Accounts, See } from '../types';
import fetchTimeline from './api/fetchTimeline';
import { BskyPostSimple } from './bluesky';
import useTimelines from './hooks/useTimelines';
import TimelinePost, { Timeline_Post } from './TimelinePost';

export type TimelineProps = {
    see: See;
    search: string;
    account: Accounts,
    onChangeSee: (update: 'posts'|'likes'|'timeline') => void;
    onChangeAccount: (update: 'mastodonSocial'|'fosstodon'|'bluesky') => void;
}
export function TimelineViewToggles({
    account,
    see,
    onChangeSee,
    onChangeAccount,

}:Omit<TimelineProps,'search'> ){
    const seeOptions = useMemo(() => {
        if( 'bluesky' === account ){
            return ['statuses', 'likes', 'timeline'];
        }
        return ['statuses']
    }, [account]);
    return (
        <div>
            <div>
                <SelectControl
                    label="Account"
                    value={account}
                    options={accountOptions}
                    // @ts-ignore
                    onChange={(update) => onChangeAccount(update)}
                />

            </div>
            <div>
                <SelectControl
                    label="See"
                    value={see}
                    options={seeOptions.map((value) => ({
                        label: value,
                        value,
                    }))}
                    onChange={(update) => onChangeSee(update as 'posts'|'likes'|'timeline')}
                />
            </div>
        </div>
    );
}

export type AccountDetailsMinimal = {
    type: 'mastodon'|'bluesky';
    name: string;
    id: string;
}

function postUriToUrl(uri:string,authorHandle:string){
    //take only the part after app.bsky.feed.post/ in uri
    uri = uri.split('/').slice(-1)[0];
    return `https://bsky.app/profile/${authorHandle}/post/${uri}`;

}




export type UseProps = {
    onCopy: (content: string) => void;
    onQuote: (content: string, citation: string) => void;
}

export default function Timeline({
    account,
    see,
    onCopy,
    onQuote,
    search
}:Omit<TimelineProps, 'onChangeSee'|'onChangeNetwork'>&UseProps){
    const {
        pageState,
        currentCursor,
        dispatchPageAction,
        hasPageByCursor,
        hasNextPage,
        cursorHasStatuses,
    } = useTimelines({account});


    const [isLoading, setIsLoading] = useState(false);
    const accountDetails = useMemo(() => {
        return accounts[account] as AccountDetailsMinimal;
    }, [account]);




    useEffect(() => {
        if( ! accountDetails ){
            return;
        }
        console.log({
            currentCursor,
            cursorHasStatuses:cursorHasStatuses(currentCursor)
        });
        if( cursorHasStatuses(currentCursor) ){
           if( ! search ){
                return;
           }
        }
        setIsLoading(true);
        fetchTimeline({
            account:accountDetails,
            see,
            cursor:currentCursor,
            search
        }).then(r => {
            //@ts-ignore
            dispatchPageAction({
                //@ts-ignore
                account: account,
                newCursor: r.cursor,
                nextCursor: r.nextCursor,
                statuses: r.statuses
            });

        }).finally(() => {
            setIsLoading(false);
        });
    },[accountDetails, see,currentCursor,search]);



    const isMastodon = 'mastodon' === accountDetails?.type;

    const posts = useMemo<Timeline_Post[]>(() => {
        const page = pageState[account].currentPage;
        const state = pageState[account].statuses[page]?.statuses;
        if( ! state ){
            return [];
        }
        if( isMastodon ){

            return state.map((post) => ({
                id: post.id,
                postUrl: post.url,
                content: post.content,
                createdAt: post.created_at,
                postAuthor: {
                    url: post.account.url,
                    displayName: post.account.display_name,
                    avatar: post.account.avatar
                },
                reply: post.reblog ? {
                    url: post.reblog.url
                } : undefined,
                medias: post.media_attachments?.map((media) => ({
                    id: media.id,
                    preview_url: media.preview_url,
                    url: media.url,
                    description: media.description
                }))
            }));
        }

        return state.map((post:BskyPostSimple) => ({
            id: post.cid,
            content: post.text,
            postAuthor: post.author,
            createdAt: post.createdAt,
            postUrl: postUriToUrl(post.uri,post.author.handle),
            reply: post.reply ? {
                url: postUriToUrl(post.reply.uri,post.reply.author.handle)
            } : undefined,
            medias: post.images ? post.images : undefined
        }));


    }, [pageState,account]);

    const Pagination = useCallback(() => {
        const state = pageState[account];
        if( ! state ){
            return null;
        }
        const {currentPage,statuses} = state;
        const hasPrev = 0 !== currentPage;
        const hasNext = hasNextPage();
        return (

                <div>
                     <ButtonGroup>
                        <Button
                            variant={hasPrev ? 'outline':undefined}
                            color={hasPrev ? 'secondary':undefined}
                            disabled={!hasPrev}
                            onClick={() => {
                                dispatchPageAction({
                                    account: account as Accounts,
                                    setPage: currentPage - 1
                                });
                            }}
                        >
                            Previous
                        </Button>
                        <Button
                            variant={hasNext ? 'outline':undefined}
                            color={hasNext ? 'secondary':undefined}
                            onClick={() => {
                                dispatchPageAction({
                                    account: account as Accounts,
                                    setPage: currentPage + 1
                                });
                            }}
                        >
                            Next
                        </Button>
                    </ButtonGroup>
                </div>

        )
    }, [pageState,account,dispatchPageAction]);

    if( ! accountDetails ){
        return <div>Account not found</div>
    }

    return (
        <div>
            <Grid>
                <Pagination />
                {isLoading && <Spinner />}
            </Grid>
            {! posts || !posts.length ? (<Spinner />) : (
                <div>
                    {posts.map((post:Timeline_Post) => (
                        <TimelinePost
                            key={post.postUrl}
                            {...post}
                            onCopy={onCopy}
                            onQuote={onQuote}
                        />
                    ))}
                </div>
            )}
                        <Pagination />

        </div>
    );
}

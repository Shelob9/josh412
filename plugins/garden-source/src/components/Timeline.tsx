import {
    ButtonGroup,
    __experimentalGrid as Grid,
    Spinner,
    TabPanel
} from '@wordpress/components';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from 'react-daisyui';
import { accounts } from '../accounts';
import { Accounts, See } from '../types';
import fetchTimeline from './api/fetchTimeline';
import { BskyPostSimple } from './bluesky';
import useTimelines, { pageState } from './hooks/useTimelines';
import TimelinePost, { Timeline_Post } from './TimelinePost';

export type TimelineProps = {
    see: See;
    search: string;
    account: Accounts,
    onChangeSee: (update: 'posts'|'likes'|'timeline') => void;
    onChangeAccount: (update: 'mastodonSocial'|'fosstodon'|'bluesky') => void;
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

function Line({
    onCopy,
    onQuote,
    currentPage,
    posts,
    hasNextPage,
    onClickPrevious,
    onClickNext,
    isLoading,
    onResetAccount,
}:Omit<TimelineProps, 'searchMyPostsOnly'|'account'|'search'|'setSearch'| 'see'|'onChangeSee'|'onChangeNetwork'>&UseProps&{
    searchMyPostsOnly:boolean,
    posts:Timeline_Post[],
    hasNextPage:() => boolean,
    currentPage:number,
    onClickPrevious:() => void,
    onClickNext:() => void,
    isLoading:boolean,
    onResetAccount:() => void,
}){



    const Pagination = useCallback(() => {

        const hasPrev = 0 !== currentPage;
        const hasNext = hasNextPage();
        return (

                <div>
                     <ButtonGroup>
                        <Button
                            variant={hasPrev ? 'outline':undefined}
                            color={hasPrev ? 'secondary':undefined}
                            disabled={!hasPrev}
                            onClick={onClickPrevious}
                        >
                            Previous
                        </Button>
                        <Button
                            variant={hasNext ? 'outline':undefined}
                            color={hasNext ? 'secondary':undefined}
                            onClick={() => {
                                onClickNext();
                            }}
                        >
                            Next
                        </Button>
                    </ButtonGroup>
                </div>

        )
    }, [currentPage,hasNextPage,onClickNext,onClickPrevious]);



    return (
        <div>
            <Grid>
                <Pagination />
                {isLoading && <Spinner />}
                <Button onClick={onResetAccount}>Reset</Button>
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

function makePosts({isMastodon,posts}:{
    isMastodon:boolean,
    posts:any[]|BskyPostSimple[]
}):Timeline_Post[]{
    if( isMastodon ){

        return posts.map((post) => ({
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

    return posts.map((post:BskyPostSimple) => ({
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
}


export default function Timeline({
    account,
    see,
    onCopy,
    onQuote,
    search,
    searchMyPostsOnly,
    onChangeAccount,
}:Omit<TimelineProps, 'onChangeSee'|'onChangeNetwork'>&UseProps&{
    searchMyPostsOnly:boolean,


}){
    const isSearch = useMemo(() => {
        return search && search.length > 2;
    }, [search]);

    const{
        cursorHasStatuses,
        hasNextPage,
        pageState,
        currentCursor,
        dispatchPageAction,
    } = useTimelines({account});

    const{
        cursorHasStatuses:searchCursorHasStatuses,
        hasNextPage:searchHasNextPage,
        pageState:searchState,
        currentCursor:currentSearchCursor,
        dispatchPageAction:dispatchSearchAction,
    } = useTimelines({account});


    const [isLoading, setIsLoading] = useState(false);
    const accountDetails = useMemo(() => {
        return accounts[account] as AccountDetailsMinimal;
    }, [account]);

    const [lastSearch, setLastSearch] = useState('');
    //clear search state when search is empty
    useEffect(() => {
        if(isSearch){
            if( ! search ){
                setLastSearch('');
            }
            if( lastSearch !== search ){
                setLastSearch(search);
            }
        }
    },[search,isSearch,lastSearch]);

    //fetch timeline
    useEffect(() => {
        if( ! accountDetails || isSearch ){
            return;
        }
        if( cursorHasStatuses(currentCursor) ){
            return;
        }


        setIsLoading(true);
        fetchTimeline({
            account:accountDetails,
            see,
            cursor: currentCursor,
            search: undefined,
            searchMyPostsOnly
        }).then(r => {
            dispatchPageAction({
                account: account,
                newCursor: r.cursor,
                nextCursor: r.nextCursor,
                statuses: r.statuses
            });

        }).finally(() => {
            setIsLoading(false);
        });
    },[accountDetails, see,currentCursor,isSearch]);

    //fetch search timeline
    useEffect(() => {
        if( ! accountDetails || ! isSearch ){
            return;
        }
        if(lastSearch !== search){
            dispatchSearchAction({
                account: account as Accounts,
                clear: true
            });
        }else{
            if( searchCursorHasStatuses(currentSearchCursor) ){
                return;
            }
        }


        setIsLoading(true);
        fetchTimeline({
            account:accountDetails,
            see,
            cursor: currentSearchCursor,
            search: search,
            searchMyPostsOnly
        }).then(r => {
            dispatchSearchAction({
                account: account,
                newCursor: r.cursor,
                nextCursor: r.nextCursor,
                statuses: r.statuses
            });

        }).finally(() => {
            setIsLoading(false);
        });
    },[accountDetails, see,currentSearchCursor,search,searchMyPostsOnly,isSearch]);




    const onResetAccount = useCallback(() => {
        dispatchPageAction({
            account: account as Accounts,
            clear: true
        });

    }, [account,dispatchPageAction]);




    const isMastodon = 'mastodon' === accountDetails?.type;

    const posts = useMemo<Timeline_Post[]>(() => {
        const getPage = (state:pageState) =>state[account].currentPage
        const getState = (state:pageState) => state[account].statuses[page]?.statuses;
        const page = getPage(pageState);
        const state = getState(pageState);
        if( ! state ){
            return [];
        }
        return makePosts({
            posts: state,
            isMastodon
        });


    }, [pageState,account]);

    const searchPosts = useMemo<Timeline_Post[]>(() => {
        const getPage = (state:pageState) =>state[account].currentPage
        const getState = (state:pageState) => state[account].statuses[page]?.statuses;
        const page = getPage(searchState);
        const state = getState(searchState);
        if( ! state ){
            return [];
        }
        return makePosts({
            posts: state,
            isMastodon
        });


    }, [pageState,account]);




    return (
        <TabPanel
            className="my-tab-panel"
            activeClass="active-tab"
            tabs={ [
                {
                    name: 'timeline',
                    title: 'Timeline',
                    className: 'tab-one',
                },
                {
                    name: 'search',
                    title: 'Search',
                    className: 'tab-two',
                },
            ] }
        >
            { ( tab ) => <>
                { 'timeline' === tab.name ? (
                    <>
                    <h2>Timeline</h2>

                    <Line
                        posts={posts}
                        hasNextPage={hasNextPage}
                        currentPage={pageState[account].currentPage}
                        onClickNext={() => {
                            dispatchPageAction({
                                setPage: pageState[account].currentPage + 1,
                                account: account as Accounts

                            });
                        }}
                        onClickPrevious={() => {
                            dispatchPageAction({
                                setPage: pageState[account].currentPage - 1,
                                account: account as Accounts
                            });
                        }}
                        isLoading={isLoading}
                        onResetAccount={onResetAccount}
                        onCopy={onCopy}
                        onQuote={onQuote}
                        onChangeAccount={onChangeAccount}
                        searchMyPostsOnly={searchMyPostsOnly}

                    />
                    </>
                ): (
                    <Line
                        posts={searchPosts}
                        hasNextPage={searchHasNextPage}
                        currentPage={searchState[account].currentPage}
                        onClickNext={() => {
                            dispatchSearchAction({
                                setPage: searchState[account].currentPage + 1,
                                account: account as Accounts

                            });
                        }}
                        searchMyPostsOnly={searchMyPostsOnly}
                        onClickPrevious={() => {
                            dispatchSearchAction({
                                setPage: searchState[account].currentPage - 1,
                                account: account as Accounts
                            });
                        }}
                        isLoading={isLoading}
                        onResetAccount={onResetAccount}
                        onCopy={onCopy}
                        onQuote={onQuote}
                        onChangeAccount={onChangeAccount}
                    />
                ) }

            </> }
        </TabPanel>
    )




}

import {
    ButtonGroup,
    __experimentalGrid as Grid,
    Spinner
} from '@wordpress/components';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from 'react-daisyui';
import { accounts } from '../accounts';
import { Accounts, See } from '../types';
import fetchTimeline from './api/fetchTimeline';
import useSearchApis from './hooks/useSearchApis';
import useTimeLinesWithSearch from './hooks/useTimelinesWithSearch';
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

export default function Timeline({
    account,
    see,
    onCopy,
    onQuote,
    search,
    searchMyPostsOnly
}:Omit<TimelineProps, 'onChangeSee'|'onChangeNetwork'>&UseProps&{
    searchMyPostsOnly:boolean
}){
    const {
        dispatchAction,
        select,

    } = useSearchApis();
    const isSearch = useMemo(() => search && search.length >2, [search]);
    const type = isSearch ? 'search' : see;
    const [lastSearch, setLastSearch] = useState('');
    const showSearch = useMemo(() => {
        return search && search.length > 2;
    }, [search]);

    const cursorHasStatuses = useCallback((cursor:string|undefined) => {
        return select({account,type}).cursorHasStatuses(cursor);
    }, [select,account,type]);

    const hasNextPage = useCallback(() => {
        return select({account,type}).hasNextPage();
    }, [select,account,type]);

    const currentCursor = useMemo(() => {
        return select({account,type}).getCurrentCursor();
    }, [select,account,type]);

    const{

        pageState,
        dispatchPageAction,
        dispatchSearchAction,
        currentSearchCursor,


        searchPageState,

    } = useTimeLinesWithSearch({account,searchMyPostsOnly});

    const [isLoading, setIsLoading] = useState(false);
    const accountDetails = useMemo(() => {
        return accounts[account] as AccountDetailsMinimal;
    }, [account]);

    //fetch timeline
    useEffect(() => {
        if( ! accountDetails ){
            return;
        }
        if( cursorHasStatuses(currentCursor) ){
            return;
        }

        setIsLoading(true);
        fetchTimeline({
            account:accountDetails,
            see,
            cursor:isSearch ? currentSearchCursor : currentCursor,
            search,
            searchMyPostsOnly
        }).then(r => {
            if( isSearch ){
                dispatchSearchAction({
                    account: account,
                    newCursor: r.cursor,
                    nextCursor: r.nextCursor,
                    statuses: r.statuses
                });
            }else{
                dispatchAction({
                    action:{
                        account: account,
                        newCursor: r.cursor,
                        nextCursor: r.nextCursor,
                        statuses: r.statuses
                    },
                    type
                });
            }

        }).finally(() => {
            setIsLoading(false);
        });
    },[accountDetails, see,currentCursor,search,searchMyPostsOnly]);

    //clear search state when search is empty
    useEffect(() => {
        if( ! search ){
            dispatchSearchAction({
                account: account,
                clear: true
            });
        }
        if( lastSearch !== search ){
            setLastSearch(search);
            dispatchAction({
                action: {
                    account: account,
                    clear: true
                },
                type,
            });
        }
    },[search,dispatchSearchAction,dispatchAction,account,type,lastSearch]);

    useEffect(() => {
        if(! see ){
            return;
        }
        console.log({see})
        dispatchAction({
            action: {
                account: account,
                clear: true
            },
            type,
        });
        dispatchSearchAction({
            account: account as Accounts,
            clear: true
        });
    },[see,dispatchAction,dispatchSearchAction,account,type]);

    const onResetAccount = useCallback(() => {
        dispatchAction({
            action: {
                account: account,
                clear: true
            },
            type,
        });
        dispatchSearchAction({
            account: account as Accounts,
            clear: true
        });
    }, [account,dispatchAction,dispatchSearchAction,type]);


    //clear search state when searchMyPostsOnly is toggled
    useEffect(() => {
        if( searchMyPostsOnly ){
            dispatchSearchAction({
                account: account,
                clear: true
            });
        }else{
            dispatchSearchAction({
                account: account,
                clear: true
            });
        }
    },[searchMyPostsOnly]);

    const isMastodon = 'mastodon' === accountDetails?.type;

    const posts = useMemo<Timeline_Post[]>(() => {
        return select({account,type}).getStatuses();



    }, [select,account,type]);


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
                                if(! hasPrev){
                                    return;
                                }
                                dispatchPageAction({
                                    account: account as Accounts,
                                    setPage: currentPage - 1
                                });
                            }}
                        >
                            {search ? 'Previous Results ' : 'Previous'}
                        </Button>
                        <Button
                            disabled={!hasNext}
                            variant={hasNext ? 'outline':undefined}
                            color={hasNext ? 'secondary':undefined}
                            onClick={() => {
                                if(! hasNext){
                                    return;
                                }
                                dispatchPageAction({
                                    account: account as Accounts,
                                    setPage: currentPage + 1
                                });
                            }}
                        >
                            {search ? 'More' : 'Next'}
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

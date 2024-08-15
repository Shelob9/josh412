import {
    ButtonGroup,
    __experimentalGrid as Grid,
    SelectControl,
    Spinner,
} from '@wordpress/components';
import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { Button } from 'react-daisyui';
import { accountOptions, accounts } from '../accounts';
import { Accounts, See } from '../types';
import { BskyPostSimple } from './bluesky';
import TimelinePost, { Timeline_Post } from './TimelinePost';

type TimelineProps = {
    see: See;
    account: Accounts,
    onChangeSee: (update: 'posts'|'likes'|'timeline') => void;
    onChangeAccount: (update: 'mastodonSocial'|'fosstodon'|'bluesky') => void;
}
export function TimelineViewToggles({
    account,
    see,
    onChangeSee,
    onChangeAccount,

}:TimelineProps ){
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

type AccountDetailsMinimal = {
    type: 'mastodon'|'bluesky';
    name: string;
    id: string;
}
const  { apiUrl,token } : {
    apiUrl: string;
    token: string;
}
//@ts-ignore
= window.GARDEN || {
    apiUrl: '',
    token: '',
};


const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
}

function fetchTimeline(account:AccountDetailsMinimal, see:See,cursor?:string): Promise<{
    statuses: any[];
    nextCursor?: string;
    cursor?: string;
}>{
    if( 'mastodon' === account.type ){
        let url = `${apiUrl}/search/mastodon/${account.id}/statuses`;
        if( cursor ){
            url += `?${cursor}`;
        }
        return fetch(url,{
            headers,
        })
            .then(response => response.json())
            .then(json => {
                console.log({json})
                return json;
            });
    }
    if( 'bluesky' === account.type ){
        return fetch(`${apiUrl}/search/bluesky/${account.id}/${see}?${cursor ? cursor : ''}`,{headers})
            .then(response => response.json())
            .then(json => {
                console.log({json})
                return json;
            });
    }
    return Promise.reject('Invalid account type');
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


type pageState = {
    mastodonSocial: {
        currentPage: 0,
        statuses: {[key: number]: {
            cursor?: string|undefined;
            statuses: any[];
        }},
    },
    fosstodon: {
        currentPage: 0,
        statuses: {[key: number]: {
            cursor?: string|undefined;
            statuses: any[];
        }},
    },
    bluesky: {
        currentPage: 0,
        statuses: {[key: number]: {
            cursor?: string|undefined;
            statuses: BskyPostSimple[];
        }},
    }
}

const createSelectors = (state:pageState,account:Accounts) => {

    const findIndexByByCursor = (cursor:string|undefined): number =>{
        if( undefined === cursor ){
            return 0;
        }
        return Object.keys(state[account].statuses).findIndex((key) => {
            return state[account].statuses[key].cursor === cursor;
        });
    }
    function pageHasStatuses(index:number): boolean{
        if( ! state[account].statuses[index] ){
            return false;
        }
        return  state[account].statuses[index].statuses.length ? true : false;
    }

    function cursorHasStatuses(cursor:string|undefined): boolean{
        const index = findIndexByByCursor(cursor);
        return pageHasStatuses(index);
    }

    return {
        pageHasStatuses,
        cursorHasStatuses,
        findIndexByByCursor,
        hasNextPage(): boolean{
            return !! state[account].statuses[state[account].currentPage + 1];
        },
        hasPage(page:number): boolean{
            return !! state[account].statuses[page];
        },
        hasPageByCursor(cursor:string|undefined): boolean{
            if( undefined === cursor ){
                return pageHasStatuses(0);
            }
            const index = findIndexByByCursor(cursor);
            if( -1 === index ){
                return false;
            }
            return pageHasStatuses(index);
        },
        getCurrentCursor(): string|undefined{
            return state[account].statuses[state[account].currentPage].cursor;
        }
    }
};
function pageReducer( state: pageState,action: {
    account: Omit<Accounts,'bluesky'>,
    newCursor?: string;
    nextCursor?: string;
    statuses: any[];
}|{
    account: 'bluesky'
    newCursor?: string;
    nextCursor?: string;
    statuses: BskyPostSimple[];
}| {
    account: Omit<Accounts,'bluesky'>
    setPage: number;
}|{
    account: 'bluesky'
    setPage: number;
}): pageState{
    const actionAccount = action.account as string;
    if( 'setPage' in action ){
        //find cursor for that page and set it as current cursor

        return {
            ...state,
            [actionAccount]: {
                ...state[actionAccount],
                currentPage: action.setPage,
            }
        }
    }
    if( undefined === action.newCursor ){
        const statuses = {
            ...state[actionAccount].statuses,
            [0]: {
                cursor: undefined,
                statuses: action.statuses
            }
        }
        if(action.nextCursor && ! state[actionAccount].statuses[1]){
            statuses[1] =  {
                cursor: action.nextCursor,
                statuses: []
            }
        }
        return {
            ...state,
            [actionAccount]: {
                ...state[actionAccount],
                statuses
            }
        }
    }else{
        let newState = {
            ...state,
        }

        //find index of action.newCursor in cursors
        Object.keys(state[actionAccount].statuses).forEach((key) => {
            if( state[actionAccount].statuses[key].cursor === action.newCursor ){
                const nextIndex = parseInt(key,10) + 1;
                newState = {
                    ...newState,
                    [actionAccount]: {
                        ...newState[actionAccount],
                        statuses: {
                            ...newState[actionAccount].statuses,
                            [key]: {
                                ...newState[actionAccount].statuses[key],
                                statuses: action.statuses
                            },
                            [nextIndex]: newState[actionAccount].statuses[nextIndex] ? {
                                cursor: action.nextCursor,
                                statuses: newState[actionAccount].statuses[nextIndex].statuses,
                            } : {
                                cursor: action.nextCursor,
                                statuses: []
                            }
                        }
                    }
                }

            }
        });
        return newState;

    }
    return state;
}

function useTimelines({account}:{
    account: Accounts
}){
    const [pageState,dispatchPageAction] = useReducer(pageReducer,{
        mastodonSocial: {
            currentPage: 0,
            statuses: {0: {
                cursor: undefined,
                statuses: []
            }}
        },
        fosstodon: {
            currentPage: 0,
            statuses: {0: {
                cursor: undefined,
                statuses: []
            }}
        },
        bluesky: {
            currentPage: 0,
            statuses: {0: {
                cursor: undefined,
                statuses: []
            }}
        }
    });

    const selectors = useMemo(() => {
        return createSelectors(pageState,account);
    },[pageState,account]);

    const currentCursor = useMemo(() => {
        return selectors.getCurrentCursor();
    },[selectors]);

    return {
        ...selectors,
        pageState,
        currentCursor,
        dispatchPageAction
    }
}

export default function Timeline({
    account,
    see,
    onCopy,
    onQuote
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
        if( cursorHasStatuses(currentCursor) ){
            return;
        }
        setIsLoading(true);
        fetchTimeline(accountDetails, see,currentCursor).then(r => {
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
    },[accountDetails, see,currentCursor])



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

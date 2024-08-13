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

function PaginationButtons({
    nextCursor,
    prevCursor,
    onClickNext,
    onClickPrev
}:{
    nextCursor?: string;
    prevCursor?: string;
    onClickNext: () => void;
    onClickPrev: () => void;
}){
    return (
      nextCursor || prevCursor ? (
        <div>
             <ButtonGroup>
                <Button variant={prevCursor ? 'outline':undefined} color={prevCursor ? 'secondary':undefined}  disabled={!prevCursor} onClick={onClickPrev}>Previous</Button>
                <Button variant={nextCursor ? 'outline':undefined} color={nextCursor ? 'secondary':undefined} onClick={onClickNext}>Next</Button>
            </ButtonGroup>
        </div>

      ) : null
    );
}

export type UseProps = {
    onCopy: (content: string) => void;
    onQuote: (content: string, citation: string) => void;
}

type Cursor = {
    cursor?: string;
    nextCursor?: string;
    prevCursor?: string;
};


export default function Timeline({
    account,
    see,
    onCopy,
    onQuote
}:Omit<TimelineProps, 'onChangeSee'|'onChangeNetwork'>&UseProps){
    const [currentCursor,setCurrentCursor] = useState<string|undefined>(undefined);
    const [cursors,setCursors] = useState<Map<number,string>>(new Map().set(0,undefined));
    const setCursor = (newCursor:string|undefined,nextCursor:string|undefined) => {
        setCursors((cursorsState) => {
            if( ! newCursor ){
                if( nextCursor ){
                    return new Map(cursorsState).set(cursorsState.size,nextCursor);
                }else{
                    return new Map(cursorsState);
                }
            }
            const cursorKey = Array.from(cursorsState.keys()).find((key) => cursorsState.get(key) === newCursor);
            if( cursorKey ){
                const newState = new Map(cursorsState);
                if( nextCursor ){
                    newState.set(cursorKey+ 1,nextCursor);

                }
                return newState;
            }else{
                const newState = new Map(cursorsState).set(cursorsState.size + 1,newCursor);
                if( nextCursor ){
                    newState.set(cursorsState.size + 2,nextCursor);
                }
                return newState;

            }
        });
    }
    const prevCursor = useMemo<string|undefined>(() => {
        if( ! cursors.size ){
            return undefined;
        }
        if( ! currentCursor ){
            return undefined;
        }
        const cursorKey = Array.from(cursors.keys()).find((key) => cursors.get(key) === currentCursor);
        if( ! cursorKey ){
            return undefined;
        }
        return cursors.get(cursorKey - 1);
    },[currentCursor,cursors]);

    const nextCursor = useMemo<string|undefined>(() => {
        if( ! cursors.size ){
            return undefined;
        }
        if( ! currentCursor  ){
            //if has cursors[1]
            if( cursors.has(1) ){
                return cursors.get(1);
            }
            return undefined;
        }
        const cursorKey = Array.from(cursors.keys()).find((key) => cursors.get(key) === currentCursor);
        if( ! cursorKey ){
            return undefined;
        }
        return cursors.get(cursorKey + 1);
    },[currentCursor,cursors]);
    const [isLoading, setIsLoading] = useState(false);

    const [bskyPosts, setBskyPosts] = useState<BskyPostSimple[]>([]);
    const [statuses, setStatuses] = useState<any[]>([]);
    const accountDetails = useMemo(() => {
        return accounts[account] as AccountDetailsMinimal;
    }, [account]);

    //when account changes, reset the cursor
    useEffect(() => {
        if( accountDetails ){
            setCurrentCursor(undefined);
            setCursors(new Map().set(0,undefined));
        }
    },[accountDetails]);


    useEffect(() => {
        if( ! accountDetails ){
            return;
        }
        setIsLoading(true);
        fetchTimeline(accountDetails, see,currentCursor).then(r => {

            setCursor(r.cursor,r.nextCursor);
            if( 'mastodon' === accountDetails.type ){
                setStatuses(r.statuses);
            } else {
                setBskyPosts(r.statuses);
            }
        }).finally(() => {
            setIsLoading(false);
        });
    },[accountDetails, see,currentCursor])

    const onClickNext = useCallback(() => {
        if( ! nextCursor ){
            return;
        }
        setCurrentCursor(nextCursor);
    },[nextCursor]);

    const onClickPrev = useCallback(() => {
        if( ! prevCursor ){
            return;
        }
        setCurrentCursor(prevCursor);
    },[prevCursor]);

    const isMastodon = 'mastodon' === accountDetails?.type;

    const posts = useMemo<Timeline_Post[]>(() => {
        if( isMastodon ){
            if(  ! statuses || !statuses.length ){
                return []
            }
            return statuses.map((post) => ({
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
        if(  ! bskyPosts || !bskyPosts.length ){
            return []
        }

        return bskyPosts.map((post:BskyPostSimple) => ({
            id: post.cid,
            content: post.text,
            postAuthor: post.author,
            postUrl: postUriToUrl(post.uri,post.author.handle),
            reply: post.reply ? {
                url: postUriToUrl(post.reply.uri,post.reply.author.handle)
            } : undefined,
            medias: post.images ? post.images : undefined
        }));


    }, [statuses, bskyPosts]);

    const Pagination = useCallback(() => (
        <PaginationButtons
            nextCursor={nextCursor}
            prevCursor={prevCursor}
            onClickNext={onClickNext }
            onClickPrev={onClickPrev}
        />
    ), [nextCursor, prevCursor]);

    if( ! accountDetails ){
        return <div>Account not found</div>
    }
    console.log({cursors,currentCursor,nextCursor,prevCursor});

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

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

function fetchTimeline(account:AccountDetailsMinimal, see:See,cursor?:string){
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
export default function Timeline({
    account,
    see,
    onCopy,
    onQuote
}:Omit<TimelineProps, 'onChangeSee'|'onChangeNetwork'>&UseProps){
    const [isLoading, setIsLoading] = useState(false);
    const [nextCursor, setNextCursor] = useState<string|undefined>(undefined);
    const [cursor,setCursor] = useState<string|undefined>(undefined);
    const [prevCursor,setPrevCursor] = useState<string|undefined>(undefined);
    const [bskyPosts, setBskyPosts] = useState<BskyPostSimple[]>([]);
    const [statuses, setStatuses] = useState<any[]>([]);
    const accountDetails = useMemo(() => {
        return accounts[account] as AccountDetailsMinimal;
    }, [account]);

    const onClickNext = () => {
        if(cursor){
            setPrevCursor(cursor);
        }
        setCursor(nextCursor);
    }
    const onClickPrev = () => {

        setCursor(prevCursor);
        if(prevCursor){
            setNextCursor(cursor);
        }
    }
    useEffect(() => {
        if( ! accountDetails ){
            return;
        }
        setIsLoading(true);
        fetchTimeline(accountDetails, see,cursor).then(r => {
            setNextCursor(r.nextCursor);
            if( 'mastodon' === accountDetails.type ){
                setStatuses(r.statuses);
            } else {
                setBskyPosts(r.statuses);
            }
        }).finally(() => {
            setIsLoading(false);
        });
    },[accountDetails, see,cursor])
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
            onClickNext={onClickNext}
            onClickPrev={onClickPrev}
        />
    ), [nextCursor, prevCursor]);

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

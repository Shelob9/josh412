import { SelectControl, Spinner } from '@wordpress/components';
import React, { useEffect, useMemo, useState } from 'react';
import { accountOptions, accounts } from '../accounts';
import { Accounts, See } from '../types';
import MastodonPosts from './MastodonPosts';

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
//const apiUrl = 'http://localhost:5050';


function fetchTimeline(account:AccountDetailsMinimal, see:See){
    if( 'mastodon' === account.type ){
        return fetch(`/search/mastodon/${account.id}/statuses`)
            .then(response => response.json())
            .then(json => json);
    }
    if( 'bluesky' === account.type ){
        return fetch(`/search/bluesky/${account.id}/${see}`)
            .then(response => response.json())
            .then(json => {
                console.log({json})
                return json;
            });
    }
    return Promise.reject('Invalid account type');
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
    const [next, setNext] = useState<string|undefined>(undefined);
    const [statuses, setStatuses] = useState<any[]>([]);
    const accountDetails = useMemo(() => {
        console.log({account, accounts});
        return accounts[account] as AccountDetailsMinimal;
    }, [account]);
    useEffect(() => {
        if( ! accountDetails ){
            return;
        }
        fetchTimeline(accountDetails, see).then(r => {
            console.log({r});
            setNext(r.nextCursor);
            setStatuses(r.statuses);
        })
    },[accountDetails, see])
    const isMastodon = 'mastodon' === accountDetails?.type;

    if( ! accountDetails ){
        return <div>Account not found</div>
    }
    if(  ! statuses || !statuses.length ){
        return <Spinner />
    }

    if( isMastodon ){
        return <MastodonPosts posts={statuses} onCopy={onCopy} onQuote={onQuote} />
    }
    return <div>Not working yet</div>
}

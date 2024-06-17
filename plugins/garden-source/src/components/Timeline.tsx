import { SelectControl, Spinner } from '@wordpress/components';
import React, { useEffect, useMemo, useState } from 'react';
import { accountOptions, accounts } from '../accounts';
import { Accounts, See } from '../types';

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

function fetchTimeline(account:AccountDetailsMinimal, see:See){
    if( 'mastodon' === account.type ){
        return fetch(`/search/mastodon/${account.id}/statuses`)
            .then(response => response.json())
            .then(json => json);
    }
    if( 'bluesky' === account.type ){
        return fetch(`/search/bluesky/${account.id}/${see}`)
            .then(response => response.json())
            .then(json => json);
    }
    return Promise.reject('Invalid account type');
}
export default function Timeline({
    account,
    see,
}:Omit<TimelineProps, 'onChangeSee'|'onChangeNetwork'>){
    const [next, setNext] = useState<string|undefined>(undefined);
    const accountDetails = useMemo(() => {
        console.log({account, accounts});
        return accounts[account] as AccountDetailsMinimal;
    }, [account]);
    useEffect(() => {
        fetchTimeline(accountDetails, see).then(r => {
            console.log({statuses:r.statues, nextCursor:r.nextCursor});
            setNext(r.nextCursor);
        })
    },[accountDetails, see])
    return (
        <div>
            <h3>Timeline</h3>
            {accountDetails ? (
                <div>
                    <p>{accountDetails.name}</p>
                    <p>{accountDetails.type}</p>
                </div>
            ) : (<Spinner />)}
        </div>
    );
}

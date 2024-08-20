import { See } from "../../types";
import { AccountDetailsMinimal } from "../Timeline";

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

function fetchTimeline({account,see,cursor,search}:{
    account:AccountDetailsMinimal,
    see:See,
    cursor?:string,
    search?:string
}): Promise<{
    statuses: any[];
    nextCursor?: string;
    cursor?: string;
    search?: string;
}>{
    if( 'mastodon' === account.type ){
        let url = new URL(`${apiUrl}/search/mastodon/${account.id}`);
        console.log({url:url.toString(),search})
        if(! search ){
            url = new URL(`${url.toString()}/statuses`);
            if( cursor ){
                url.searchParams.append('cursor',cursor);
            }
        }else{
            url.searchParams.append('q',search);
        }

        return fetch(url.toString(),{
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

export default fetchTimeline;

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

function fetchTimeline({account,see,cursor,search,searchMyPostsOnly}:{
    account:AccountDetailsMinimal,
    see:See,
    searchMyPostsOnly?:boolean,
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
        if(! search ){
            url = new URL(`${url.toString()}/statuses`);
            if( cursor ){
                url.searchParams.append('cursor',cursor);
            }
        }else{
            url.searchParams.append('q',search);
            if(searchMyPostsOnly){
                url.searchParams.append('accountId',account.id);
            }
        }

        return fetch(url.toString(),{
            headers,
        })
            .then(response => response.json())
            .then(json => {
                console.log({mastodon:json})
                return json;
            });
    }
    if( 'bluesky' === account.type ){
        const isSearch = search && search.length > 3;
        let url = isSearch ? `${apiUrl}/search/bluesky/${account.id}` : `${apiUrl}/search/bluesky/${account.id}/${see}`;

        if( isSearch ){
            url = `${url}?q=${search}`;
            if(cursor){
                url = `${url}&${cursor}`;
            }
            if(searchMyPostsOnly){
                url = `${url}&accountId=${account.id}`;
            }
        }else{
            if(cursor){
                url = `${url}?${cursor}`;
            }
        }
        console.log({url})
        return fetch(url,{headers})
                .then(response => response.json())
                .then(json => {
                    console.log({bluesky:json})
                    return json;
                });

    }
    return Promise.reject('Invalid account type');
}

export default fetchTimeline;

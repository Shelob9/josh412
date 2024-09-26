import { Accounts } from "../../types";
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
export type CreatedItem = {
    uuid: string;
    created:boolean;
    remoteId: string;
}

export function fetchInjestItems({account,cursor,}:{
    account:AccountDetailsMinimal,

    cursor?:string,
}): Promise<{
    nextCursor?: string;
    items:CreatedItem[];
}>{

    let url = new URL(`${apiUrl}/items/injest/${account.type}/${account.id}`);
    if( cursor ){
        if( cursor.includes('?')){
            url = new URL(`${apiUrl}/items/injest/${account.type}/${account.id}${cursor}`);
        }else if (cursor.includes('cursor=')){
            url = new URL(`${apiUrl}/items/injest/${account.type}/${account.id}?${cursor}`);

        }
        url.searchParams.append('cursor',cursor);
    }

    return fetch(url.toString(),{
        headers,
        method: 'POST',
    })
        .then(response => response.json())
        .then(json => {
            if( 'mastodon' === account.type ){
                return {
                    nextCursor: json.cursor,
                    items:json.items
                }
            }
            console.log({json})
            return json;
        });
}
export default function fetchItems({page,perPage,search,sourceType}:{

    page?:number,
    perPage?:number,
    search?:string,
    sourceType?:Accounts
}): Promise<{
    statuses: any[];
    nextCursor?: string;
    cursor?: string;
    search?: string;
}>{
    let url = new URL(`${apiUrl}/items`);

    if( sourceType ){
        url = new URL(`${apiUrl}/items/sourcetype/${sourceType}`);
    }else if (search){
        url = new URL(`${apiUrl}/items/search`);
    }
    if( search ){
        url.searchParams.append('q',search);
    }

    if( page ){
        url.searchParams.append('page',page.toString());
    }
    if( perPage ){
        url.searchParams.append('perPage',perPage.toString());
    }
    return fetch(url.toString(),{
        headers,
    })
        .then(response => response.json())
        .then(json => {
            if('items' in json){
                return {
                    ...json,
                    statuses: json.items,

                }
            }
            return json;
        });

}

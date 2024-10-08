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
        if( 'bluesky' === account.type ){
            url.searchParams.append('cursor',cursor);
        }else{
            url.searchParams.append('maxId',cursor);
        }
    }

    return fetch(url.toString(),{
        headers,
        method: 'POST',
    })
        .then(response => response.json())
        .then(json => {

            console.log({json})
            return json;
        });
}
export default function fetchItems({page,perPage,search,source}:{

    page?:number,
    perPage?:number,
    search?:string,
    source?:Accounts
}): Promise<{
    statuses: any[];
    nextCursor?: string;
    cursor?: string;
    source?: string;
    totalPages: number;
}>{
    let url = new URL(`${apiUrl}/items`);
    if( source ){
        if( 'bluesky' === source ){
            url = new URL(`${apiUrl}/items/sourcetype/bluesky`);

        }else{
            url = new URL(`${apiUrl}/items/source/${source}`);
        }
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
                    totalPages: json.totalPages,
                }
            }
            return json;
        });

}

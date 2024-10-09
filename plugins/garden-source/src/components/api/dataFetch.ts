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

export {
    apiUrl
};

export default function dataFetch(endpoint:string,init?: RequestInit): Promise<Response> {
    if(endpoint.startsWith(apiUrl)){
        return fetch(endpoint,init ? {
            ...init,
            headers
        } : {headers});
    }
    return fetch(`${apiUrl}${endpoint}`,init ? {
        ...init,
        headers
    } : {headers});
}

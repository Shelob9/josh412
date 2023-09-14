export const makeSourceType = ({
    network,
    instanceUrl,
    accountId,
}: {
    network: string;
    instanceUrl: string;
    accountId?: string;
}) => {
    if( instanceUrl.startsWith('https://') ){
        instanceUrl = instanceUrl.replace('https://', '' );
    }
    return `socialpost:${network}:${instanceUrl}${accountId ? `:A_${accountId}` : ''}`;
}
export const makeSocialPostKey = ({network,instanceUrl,id,accountId}:{
    network: string;
    instanceUrl: string;
    id: string;
    accountId: string;
}) => {
    return `${makeSourceType({network,instanceUrl,accountId})}:${id}`;
}

export const makeInjestLastKey = ({network,instanceUrl,accountId}:{
    accountId:string,
    network: string,
    instanceUrl: string,
}) => {
    return `meta_socialpost:injest:${makeSourceType({network,instanceUrl,accountId})}:lastid`;
}

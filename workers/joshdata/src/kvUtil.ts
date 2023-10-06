
type NETWORK_INSTANCE_ACCOUNT = {
    network: string;
    instanceUrl: string;
    accountId?: string;
};
export const makeSourceType = ({
    network,
    instanceUrl,
    accountId,
}: NETWORK_INSTANCE_ACCOUNT) => {
    if( instanceUrl.startsWith('https://') ){
        instanceUrl = instanceUrl.replace('https://', '' );
    }
    return `socialpost:${network}:${instanceUrl}${accountId ? `:A_${accountId}` : ''}`;
}
export const makeSocialPostKey = ({network,instanceUrl,id,accountId}:NETWORK_INSTANCE_ACCOUNT & {id: string}) => {
    return `${makeSourceType({network,instanceUrl,accountId})}:${id}`;
}

export const makeInjestLastKey = ({network,instanceUrl,accountId}:NETWORK_INSTANCE_ACCOUNT) => {
    return `meta_socialpost:injest:${makeSourceType({network,instanceUrl,accountId})}:lastId`;
}

//A list of all lastIds used for injests
export const makeInjestLastIdListKey = ({network,instanceUrl,accountId}:NETWORK_INSTANCE_ACCOUNT) => {
    return `meta_socialpost:injest:${makeSourceType({network,instanceUrl,accountId})}:lastIdList`;
}

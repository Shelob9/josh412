export type BskyAuthorSimple = {
    url: string;
    avatar: string;
    displayName: string;
    handle: string;
    did: string;
}
export type BskyPostSimple = {
    url: string;
    uri: string;
    cid: string;
    replyCount: number,
    repostCount: number;
    likeCount: number;
    author: BskyAuthorSimple;
    text: string;
    reply?: BskyPostSimple;
    images? :{
        id: string;
        description: string;
        url: string;
        preview_url: string;
    }[]
}

import { Timeline_Post } from "./TimelinePost";

export type UIItem = {
    uuid: string;
    content: string;
    source: string;
    sourceType: string;
    remoteId: string
    remoteAuthorId: string;
    remoteReplyToAuthorId?: string
    remoteReplyToId?: string
    author: {
        url: string,
        displayName: string,
        avatar: string,
        handle: string
        uuid: string
    },
    url: string;
    classifications: any[],
    createdAt?: string
}

export type Timeline_Post_From_UIItem = Timeline_Post &{
    item: UIItem
}

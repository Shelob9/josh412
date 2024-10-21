export type BskyAuthor = {
    did: string;
    handle: string;
    displayName: string;
    avatar: string;
    associated: {
        chat: {
            allowIncoming: string;
        };
    };
    viewer: {
        muted: boolean;
        blockedBy: boolean;
    };
    labels: string[];
    createdAt: string;
};

export type BskyReplyRef = {
    parent: {
        cid: string;
        uri: string;
    };
    root: {
        cid: string;
        uri: string;
    };
}
export type BskyPostRecord = {
    $type: "app.bsky.feed.post";
    createdAt: string;
    langs: string[];
    reply?: BskyReplyRef;
    text: string;
};
export type BskyReply = {
    root: PostView;
    parent: PostView;
};

type PostView = {
    $type: "app.bsky.feed.defs#postView";
    uri: string;
    cid: string;
    author: Author;
    record: Record;
    replyCount: number;
    repostCount: number;
    likeCount: number;
    indexedAt: string;
    viewer: Viewer;
    labels: Label[];
};

type Author = {
    did: string;
    handle: string;
    displayName: string;
    avatar: string;
    associated: {
        chat: {
            allowIncoming: string;
        };
    };
    viewer: {
        muted: boolean;
        blockedBy: boolean;
        following: string;
    };
    labels: Label[];
    createdAt: string;
};

type Record = {
    $type: "app.bsky.feed.post";
    createdAt: string;
    langs: string[];
    text: string;
};

type Viewer = {
    like: string;
    threadMuted: boolean;
};

type Label = {
    src: string;
    uri: string;
    cid: string;
    val: string;
    cts: string;
};

export type BskyPost = {
    uri: string;
    cid: string;
    record: BskyPostRecord;
    reply? : BskyReply;
    replyCount: number,
    repostCount: number,
    likeCount: number,
    labels: string[ ]
}

export type BskyAuthorSimple = {
    url: string;
    avatar: string;
    displayName: string;
    handle: string;
    did: string;
}
export type BskyPostSimpleImage = {
    description: string;
    url: string;
    previewUrl: string;
    remoteId: string;
    height: number;
    width: number;

}

export type BskyPostSimple = {
    url: string;
    uri: string;
    cid: string;
    replyCount: number,
    createdAt: string;
    repostCount: number;
    likeCount: number;
    author: BskyAuthorSimple;
    text: string;
    reply?: BskyPostSimple;
    images:BskyPostSimpleImage[];
}

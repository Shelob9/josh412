import { INSERT_FEEDER_SCHEDULED_POST, TABLE_FEEDER_SCHEDULED_POSTS } from "../db/schemas";
import DataService from "./DataService";
import DataServiceProvider from "./DataServiceProvider";

//Duplicated from scheduler-client
export type Account = {
    network: 'mastodon' | 'bluesky';
    instanceUrl: string;
    accountId: string;
    accountHandle: string;
    accountAvatarUrl: string;
    accountKey: string;
}

//When creating can be for more than one account
export type InsertScheduledPost = {
    text: string;
    mediaKeys?: string[];
    accountKeys: string[]
    //Unix timestamp in seconds
    postAt: number;
}
export type ScheduledPost = {
    id: number;
    text: string;
    postKey: string;
    mediaKeys?: string[];
    savedAt: Date;
    sendAt: Date;
    hasSent: boolean;
    accountKey: string;
}

export interface IPostsService {
    savePost(post: Omit<ScheduledPost,"postKey"|"id"|"savedAt,hasSent">): Promise<boolean>;
    getSavedPost(key: string): Promise<ScheduledPost | null>;
    getSavedPosts(account: Account): Promise<ScheduledPost[]>;
    deletePost(post: ScheduledPost): Promise<boolean>;
    markPostAsSent(post: ScheduledPost): Promise<boolean>;
    markPostAsSentByKey(key: string): Promise<boolean>;

}

export default class ScheduledPostData extends DataService implements IPostsService {
    constructor(data: DataServiceProvider){
        super(data);
    }
    async savePost(post: Omit<ScheduledPost,"postKey"|"id"|"sendAt">) {
        const postKey = this.uuid();
        console.log({postKey});
        const data  = {
            ...post,
            postKey,
            sendAt: (new Date().valueOf()).toString(),
            hasSent: false,
        }
        await this.kv.put(postKey, JSON.stringify(data));
        return true;
    }
    async _savePost(post: InsertScheduledPost, _post: INSERT_FEEDER_SCHEDULED_POST) {
        const postAt = new Date(post.postAt * 1000);
        const postKeys = post.accountKeys.map(async (accountKey) => {
            const account = await this.accounts.getAccount(accountKey);
            if( ! account ){
                throw new Error("Account not found");
            }
            const postKey = this.scheduledPostKey(postAt, accountKey);
            await this.db.insert(TABLE_FEEDER_SCHEDULED_POSTS).values({
                ..._post,
                text: post.text,
                mediaKeys: post.mediaKeys,
                //sendAt: postAt,
                accountKey,
                //savedAt: Date.now(),
                hasSent: false,
                postKey
            });
            return postKey;
        });

        return postKeys;
    }


    async getSavedPost(key: string) {
        const data = await this.kv.get(key);
        if (data === null) {
            return null;
        }
        return JSON.parse(data) as ScheduledPost;
    }

    async markPostAsSentByKey(key: string) {
        const data = await this.getSavedPost(key);
        if (data === null) {
            throw new Error("Post not found");

        }
        await this.kv.put(key, JSON.stringify({
            ...data,
            hasSent: true,
        }));
        return true;
    }

    async markPostAsSent(post: ScheduledPost) {
        await this.kv.put(post.postKey, JSON.stringify({
            ...post,
            hasSent: true,
        }));
        return true;
    }

    async getSavedPosts(account: Account) : Promise<ScheduledPost[]> {
        let completed = false;
        let cursor : string|null = null;
        const posts: ScheduledPost[] = [];
        while( ! completed ){
            // @ts-ignore
            const thisList = await this.kv.list({
                prefix: this.accountKey(account),
                cursor,
            });
            if( thisList.keys ){
                thisList.keys.map(async ({name}:{
                    name:string
                }) => {
                    const data = await this.getSavedPost(name);
                    if( data ){
                        posts.push(data);
                    }
                });
            }
            if( ! thisList.list_complete && thisList.cursor ){
                cursor = thisList.cursor;
            }
            if( thisList.list_complete ){
                completed = true;
            }

        }
        return posts;

    }

    async deletePost(post: ScheduledPost) {
        await this.kv.delete(post.postKey);
        return true;
    }

}

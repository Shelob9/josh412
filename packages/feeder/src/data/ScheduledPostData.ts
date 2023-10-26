import DataService from "./DataService";
import DataServiceProvider from "./DataServiceProvider";

//Duplicated from scheduler-client
export type Account = {
    network: 'mastodon' | 'bluesky';
    instanceUrl: string;
    accountId: string;
    accountName: string;
    accountHandle: string;
    accountAvatarUrl: string;
    key: string;
}
export type InsertScheduledPost = {
    text: string;
    mediaKeys?: string[];
    accounts: string[]
    //Unix timestamp in seconds
    postAt: number;
}
export type ScheduledPost = InsertScheduledPost & {
    key: string;
    //Unix timestamp in seconds
    savedAt: number;
    hasSent: boolean;
}


export default class ScheduledPostData extends DataService {
    constructor(data: DataServiceProvider){
        super(data);
    }
    async savePost(post: InsertScheduledPost) {
        const savedAt = Math.round(Date.now().valueOf() / 1000);
        const keys = post.accounts.map(account => this.accountKey(account));
        keys.map(async (key) => {
            const data: ScheduledPost = {
                ...post,
                key,
                savedAt,
                hasSent: false,
            }
            await this.kv.put(key, JSON.stringify(data));
        })
        return keys;
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
        await this.kv.put(post.key, JSON.stringify({
            ...post,
            hasSent: true,
        }));
        return true;
    }

    async getSavedPosts(account: Account) {
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

    }

}

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

//When creating can be for more than one account
export type InsertScheduledPost = {
    text: string;
    mediaKeys?: string[];
    accounts: string[]
    //Unix timestamp in seconds
    postAt: number;
}
// Insert per account
export type ScheduledPost = InsertScheduledPost & {
    key: string;
    accountKey: string;
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
        const postAt = new Date(post.postAt * 1000);
        const accounts = await Promise.all(post.accounts.map(async (accountKey) => {
            const account = await this.accounts.getAccount(accountKey);
            if (!account) {
                throw new Error(`Account ${accountKey} not found`);
            }
            return account;
        }));
        if( ! accounts.length ){
            throw new Error("No valid accounts found");

        }
        const postKeys = Promise.all(accounts.map(async (account) => {
            const accountKey = this.accountKey(account);
            const postKey = this.scheduledPostKey(postAt, accountKey);
            await this.kv.put(postKey, JSON.stringify({
                ...post,
                key: postKey,
                accountKey,
                savedAt,
                hasSent: false,
            }));
            return postKey;
        }));
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

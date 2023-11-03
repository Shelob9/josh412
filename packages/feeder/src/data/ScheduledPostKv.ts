import DataService from "./DataService";
import DataServiceProvider from "./DataServiceProvider";
import { Account, IPostsService, ScheduledPost } from "./ScheduledPostData";


export default class ScheduledPostKv extends DataService implements IPostsService {
    constructor(data: DataServiceProvider){
        super(data);
    }

    async savePost(post: Omit<ScheduledPost,"postKey"|"id"|"savedAt">) {
        if( 'string' === typeof post.sendAt ){
            post.sendAt = new Date(post.sendAt);
        }
        const account = await this.accounts.getAccount(post.accountKey);
        const postKey = this.scheduledPostKey( post.sendAt, account);

        const data  = {
            ...post,
            postKey,
            savedAt: (new Date().valueOf()).toString(),
            hasSent: false,
        }
        try {
            await this.kv.put(postKey, JSON.stringify(data));

            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
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
        const prefix = this.accountKey(account);
        let collection : ScheduledPost[] = [];
        let completed
        while( ! completed ){
            const {posts, nextCursor} = await this.listPosts(prefix);
            collection = [
                ...collection,
                ...posts
            ];
            completed = ! nextCursor;
        }
        return collection;

    }
    private async  listPosts(prefix:string, cursor?:string): Promise<{
        posts: ScheduledPost[],
        nextCursor?: string
    }>{
        const data = await this.kv.list({
            prefix,
             cursor,
          });
          console.log({data:data.keys})
          if( data.keys ){
              const posts = await Promise.all(data.keys.map( async ({name}:{
                name: string
              }) => {
                    const post = await this.getSavedPost(name);
                    if( post ){
                        return post;
                    }
                }));
                return {
                    posts: posts.filter( p => p !== undefined ) as ScheduledPost[],
                    // @ts-ignore
                    nextCursor: data.cursor ?? undefined,
                };

          }
          return {
            posts: [],
            nextCursor: undefined,
          };

    }



    async deletePost(post: ScheduledPost) {
        await this.kv.delete(post.postKey);
        return true;
    }

}

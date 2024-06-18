import {
    AppBskyFeedDefs
} from "@atproto/api";
import React from 'react';

function postUriToUrl(uri:string,authorHandle:string){
    //take only the part after app.bsky.feed.post/ in uri
    uri = uri.split('/').slice(-1)[0];
    return `https://bsky.app/profile/${authorHandle}/post/${uri}`;

}
function BlueskyPost(props:{
    post: AppBskyFeedDefs.FeedViewPost
}){
    console.log(props.post);
    return null;
    const {post} = props.post;
    // @ts-ignore
    const record : {text:string} = post.record;
    return (
        <div key={post.cid}>
            <h2><a href={`https://bsky.app/profile/${post.author.handle}`} target="__blank">{post.author.displayName}</a></h2>
            <p dangerouslySetInnerHTML={{__html: record.text}} />
            <a href={postUriToUrl(post.uri,post.author.handle)} target="__blank">View</a>
        </div>
    )
}
export default function BlueskyPosts({posts}:{
    posts: AppBskyFeedDefs.FeedViewPost[]
}){

    return (
        <div>
            {posts.map((item:AppBskyFeedDefs.FeedViewPost) => <BlueskyPost
                post={item} key={item.post.cid}
                />)}
        </div>
    );
}

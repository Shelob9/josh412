
import React from 'react';
import { BskyPostSimple } from "./bluesky";
import { UseProps } from './Timeline';
import TimelinePost from './TimelinePost';
function postUriToUrl(uri:string,authorHandle:string){
    //take only the part after app.bsky.feed.post/ in uri
    uri = uri.split('/').slice(-1)[0];
    return `https://bsky.app/profile/${authorHandle}/post/${uri}`;

}

export default function BlueskyPosts({posts,onCopy,onQuote}:{
    posts: BskyPostSimple[]
}&UseProps){

    return (
        <>
            {posts.map((post:BskyPostSimple) => (
                <TimelinePost
                    key={post.cid}
                    content={post.text}
                    postAuthor={post.author}
                    postUrl={postUriToUrl(post.uri,post.author.handle)}
                    reply={post.reply ? {
                        url: postUriToUrl(post.reply.uri,post.reply.author.handle)
                    } : undefined}
                    onCopy={onCopy}
                    onQuote={onQuote}

                />
            ))}
        </>
    );
}

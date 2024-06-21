import React from 'react';
import { BskyPostSimple } from "./bluesky";
import { UseProps } from './Timeline';

function postUriToUrl(uri:string,authorHandle:string){
    //take only the part after app.bsky.feed.post/ in uri
    uri = uri.split('/').slice(-1)[0];
    return `https://bsky.app/profile/${authorHandle}/post/${uri}`;

}
function BlueskyPost({post,onCopy,onQuote,}:{
    post: BskyPostSimple

}&UseProps){

    return (
        <div key={post.cid}>
            <h2><a href={post.author.url} target="__blank">{post.author.displayName}</a></h2>
            <p dangerouslySetInnerHTML={{__html: post.text}} />
            <a href={postUriToUrl(post.uri,post.author.handle)} target="__blank">View</a>
            <div className="flex-grid">
                <a href={post.url} target="_blank" className="col">View</a>

                <button className="col" onClick={() => onCopy(post.text)}>Copy</button>
                <button className="col"
                    onClick={() => onQuote(post.text,`<a href="${post.author.url}">${post.author.displayName}</a>`)}
                    >Quote</button>
            </div>
        </div>
    )
}
export default function BlueskyPosts({posts,onCopy,onQuote}:{
    posts: BskyPostSimple[]
}&UseProps){

    return (
        <div>
            {posts.map((post:BskyPostSimple) => <BlueskyPost
                post={post}
                key={post.cid}
                onCopy={onCopy}
                onQuote={onQuote}
            />)}
        </div>
    );
}

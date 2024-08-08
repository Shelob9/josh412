import {
    Button,
    __experimentalHStack as HStack,
    __experimentalVStack as VStack,
} from '@wordpress/components';
import React from 'react';
import { BskyPostSimple } from "./bluesky";
import { PostAuthor } from './Posts';
import { UseProps } from './Timeline';
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
                <VStack key={post.cid}>
                    <PostAuthor url={post.author.url} displayName={post.author.displayName} avatar={post.author.avatar}  />
                    <div dangerouslySetInnerHTML={
                        { __html: post.text }
                    }/>
                     <HStack>
                            <a href={post.url} target="_blank">View</a>

                            <Button  onClick={() => onCopy(post.text)}>Copy</Button>
                            <Button
                                onClick={() => onQuote(
                                    `<p>${post.text}</p>`,
                                    `<a href="${post.author.url}">${post.author.displayName}</a>`)}
                            >Quote</Button>
                            {post.reply ? (<a href={post.reply.url} target="_blank">See Reply</a>) : null}
                        </HStack>
                </VStack>
            ))}
        </>
    );
}

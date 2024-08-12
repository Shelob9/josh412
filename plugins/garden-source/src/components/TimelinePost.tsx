
import React from 'react';

import {
    Button,
    ButtonGroup,
    FlexItem,
    __experimentalGrid as Grid,
    __experimentalVStack as VStack,
} from '@wordpress/components';
import { PostAuthor } from "./Posts";
import { UseProps } from "./Timeline";
export default function TimelinePost({medias,content,postAuthor,postUrl,reply,onCopy,onQuote }:{
    content:string,
    postAuthor: {
        url: string,
        displayName: string,
        avatar: string,
    },
    postUrl: string,
    reply?: {
        url:string
    },
    medias?: {
        id:string;
        preview_url:string;
        url:string;
        description:string;
    }[]
}&UseProps){
    return (
        <>
            <VStack
                alignment="edge"
                spacing={'4px'}
            >
                <PostAuthor
                    url={postAuthor.url}
                    displayName={postAuthor.displayName}
                    avatar={postAuthor.avatar}
                />
                <div dangerouslySetInnerHTML={
                    { __html: content }
                }/>
                <FlexItem>
                    {medias && (
                        <Grid

                        >
                            {medias.map((media) => {
                                return (

                                        <img
                                            key={media.id}
                                        src={media.preview_url} alt={media.description}

                                        />
                                )
                            })}
                        </Grid>
                    )}
                </FlexItem>
                <ButtonGroup>
                        <Button href={postUrl} target="_blank">View</Button>

                        <Button variant='secondary' onClick={() => onCopy(content)}>Copy</Button>
                        <Button
                        variant='secondary'
                            onClick={() => onQuote(
                                `<p>${content}</p>`,
                                `<a href="${postAuthor.url}">${postAuthor.displayName}</a>`)}
                        >Quote</Button>
                        {reply ? (<a href={reply.url} target="_blank">See Reply</a>) : null}
                    </ButtonGroup>
            </VStack>
        </>
    );

}

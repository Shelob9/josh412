
import React from 'react';

import {
    Button,
    ButtonGroup,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    __experimentalGrid as Grid
} from '@wordpress/components';
import { PostHeader } from "./Posts";
import { UseProps } from "./Timeline";
export type Timeline_Post_Author = {
    url: string,
    displayName: string,
    avatar: string,
};
export type Timeline_Post = {
    id:string,
    createdAt:string,
    content:string,
    postAuthor: Timeline_Post_Author,
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
}
export default function TimelinePost({medias,content,postAuthor,postUrl,reply,createdAt,onCopy,onQuote }:Timeline_Post&UseProps){
    return (
        <>
        <Card>
            <CardHeader>
                    <PostHeader
                        url={postAuthor.url}
                        displayName={postAuthor.displayName}
                        avatar={postAuthor.avatar}
                        createdAt={createdAt}
                    />

            </CardHeader>
            <CardBody>
                <div dangerouslySetInnerHTML={
                    { __html: content }
                }/>
                {medias && (
                    <Grid

                    >
                        {medias.map((media) => {
                            return (

                                    <img
                                        key={media.id}
                                        src={media.preview_url}
                                        alt={media.description}
                                    />
                            )
                        })}
                    </Grid>
                )}
            </CardBody>
            <CardFooter>
                <ButtonGroup>
                    <Button href={postUrl} target="_blank">View</Button>

                    <Button variant='secondary' onClick={() => onCopy(content)}>Copy</Button>
                    <Button
                    variant='secondary'
                        onClick={() => onQuote(
                            `<p>${content}</p>`,
                            `<a href="${postAuthor.url}">${postAuthor.displayName}</a>`)}
                    >Quote</Button>
                    {reply ? (<Button href={reply.url} target="_blank">View Reply</Button>) : null}
                </ButtonGroup>
            </CardFooter>
        </Card>

        </>
    );

}

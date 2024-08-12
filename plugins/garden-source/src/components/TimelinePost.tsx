
import React from 'react';

import {
    Button,
    ButtonGroup,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    __experimentalGrid as Grid,
    __experimentalHeading as Heading
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
        <Card>
            <CardHeader>
                <Heading level={ 4 }>
                    <PostAuthor
                        url={postAuthor.url}
                        displayName={postAuthor.displayName}
                        avatar={postAuthor.avatar}
                    />
                </Heading>
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

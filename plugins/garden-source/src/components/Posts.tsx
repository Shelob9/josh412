import { Flex, FlexItem } from '@wordpress/components';
import React from 'react';
export const PostAuthor = ({displayName,url,avatar}:{displayName:string,url:string,avatar:string}) => {
    return (
        <Flex>
            <FlexItem
            >
                <a href={url} target="__blank">
                    <img  style={{
                        maxHeight: '60px',
                        width: 'auto',
                    }}
                        src={avatar} />
                </a>
            </FlexItem>
            <FlexItem


            >
                <a href={url} target="__blank">{displayName}</a>
            </FlexItem>
        </Flex>
    )

}

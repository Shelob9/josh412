import { Flex, FlexItem } from '@wordpress/components';
import React from 'react';
export const PostHeader = ({displayName,url,avatar,createdAt}:{displayName:string,url:string,avatar:string,createdAt:string}) => {
    return (
        <div>
            <div>
                <Flex>
                    <FlexItem
                    >
                        <a href={url} target="__blank">
                            <img  style={{
                                maxHeight: '30px',
                                maxWidth: '30px',
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
            </div>
            {createdAt ? (
                <div>
                    {new Date(createdAt).toLocaleString('en-US', {
                        hour12: true,

                        second: undefined
                    })}
                </div>
            ) : null}
        </div>
    )

}

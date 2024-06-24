import React from 'react';
export const PostAuthor = ({displayName,url,avatar}:{displayName:string,url:string,avatar:string}) => {
    return (
        <div className="flex-grid-thirds">
            <a href={url} target="__blank">
                <img className="col-1" style={{
                    maxHeight: '100px'
                }}
                    src={avatar} />
            </a>
            <div className="col-2"><a href={url} target="__blank">{displayName}</a></div>
        </div>
    )

}

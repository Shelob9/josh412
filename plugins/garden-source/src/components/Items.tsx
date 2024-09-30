import React from "react";
import { Accounts } from "../types";
import fetchItems from "./api/fetchItemts";
import Table, { TablePagination } from "./Table";
import { TimelineRender } from "./Timeline";
import { Timeline_Post } from "./TimelinePost";
type UIItem = {
    uuid: string;
    content: string;
    source: string;
    sourceType: string;
    remoteId: string
    remoteAuthorId: string;
    remoteReplyToAuthorId?: string
    remoteReplyToId?: string
    author: {
        url: string,
        displayName: string,
        avatar: string,
        handle: string
        uuid: string
    },
    url: string
}

const headers = [
    {
        id: 'id',
        children: 'id'
    },
    {
        id: 'content',
        children: 'Content'
    },
    {
        id: 'author',
        children: 'Author'
    },
    {
        id: 'url',
        children: 'URL'
    }
]
export default function Items({account}:{
    account: Accounts
}) {
    const [showAll,setShowAll] = React.useState(false);
    const [page,setPage] = React.useState(1);
    const [perPage,setPerPage] = React.useState(25);
    const [items,setItems] = React.useState<{
        fosstodon: UIItem[]
        mastodonSocial: UIItem[];
        bluesky: UIItem[];
        items: UIItem[];
    }>(() => {
        return {
            fosstodon: [],
            mastodonSocial: [],
            bluesky: [],
            items: []
        }
    });
    const [nextCursor, setNextCursor] = React.useState<string | undefined>(undefined);
    React.useEffect(() => {
            fetchItems({page,perPage,search:undefined,source:showAll ? undefined : account})
                .then(({statuses,nextCursor}) => {
                    setItems((prevItems) => {
                        if( showAll ){
                            return {
                                ...prevItems,
                                items: statuses
                            }
                        }
                        return {
                            ...prevItems,
                            [account]: statuses
                        }
                    });
                    setNextCursor(nextCursor);
                });

    },[account])
    const posts = React.useMemo<Timeline_Post[]>(() => {
        const itemToPost = (item:UIItem) => {
            const post : Timeline_Post = {
                id: item.uuid,
                createdAt:'',//not saved
                content:item.content,
                postAuthor: {
                    url: item.author.url,
                    displayName: item.author.displayName,
                    avatar: item.author.avatar,
                },
                postUrl: item.url,
                reply: {
                    url: item.remoteReplyToId ?? '',
                },
                        };
            return post;
        }
        if( showAll ){
            return items.items.map(itemToPost)
        }
        return items[account].map(itemToPost)
    },[showAll,items,account]);

    const rows = React.useMemo< {
		key:string,
		cells: {
			key:string,
			Render:() => React.ReactNode,
			className?:string
		}[]
	}[]>(() => {

        return posts.map((post) => {
            return {
                key: post.id,
                cells: [
                    {
                        key: 'id',
                        Render:() =>  post.id
                    },
                    {
                        key: 'content',
                        Render:() =>  post.content
                    },

                    {
                        key: 'author',
                        Render: () => <a href={post.postAuthor.url}
                            target="_blank"
                            rel="noreferrer"
                        >{post.postAuthor.displayName}</a>
                    },
                    {
                        key: 'url',
                        Render: () => <a href={post.postUrl}
                            target="_blank"
                            rel="noreferrer"
                        >{post.postUrl}</a>
                    }
                ]
            }
        })


    },[posts]);
    if( ! posts || posts.length === 0 ){
        return <p>No items</p>
    }
    return (
        <>
            {! posts || posts.length === 0 ? <p>No items</p> : <div>
                <TimelineRender
                    account={account}
                    see="statuses"
                    onChangeAccount={() => {}}
                    searchMyPostsOnly={false}
                    search={''}
                    Render={() => (
                        <Table
                            headers={headers}
                            rows={rows}
                            caption={`Items from ${account}`}
                        />
                    )}
                />

                <TablePagination currentPage={page} totalPages={1} displayingNum={posts.length}  />
            </div>}
        </>
    )
}

import { Spinner } from "@wordpress/components";
import React, { useMemo } from "react";
import { Accounts } from "../types";
import fetchItems from "./api/fetchItemts";
import usePagedState from "./hooks/usePagedState";
import Table, { TablePagination } from "./Table";
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
    const [isLoading,setIsLoading] = React.useState(false);
    const {
        pageState,
        dispatchPageAction,
        hasPage,
        currentPage,
        setCurrentPage,
        perPage,
        totalPages
    } = usePagedState<UIItem,UIItem>({account});

    const hasNextPage = useMemo(() => currentPage < totalPages,[currentPage,totalPages]);
    const hasPrevPage = useMemo(() => {
        return currentPage > 1;
    },[currentPage]);
    const setNextPage = () => {
        if( hasNextPage ){
            setCurrentPage(currentPage + 1);
        }
    }

    const setPrevPage = () => {
        if( hasPrevPage ){
            setCurrentPage(currentPage - 1);
        }
    }

    React.useEffect(() => {
        if( isLoading || hasPage(currentPage) ){
            return;
        }
        setIsLoading(true);
            fetchItems({page:currentPage,perPage,search:undefined,source:account})
                .then(({statuses,totalPages}) => {
                    dispatchPageAction({
                        account,
                        statuses,
                        page:currentPage,
                        totalPages,
                    })
                }).finally(() => {
                    setIsLoading(false);
                });

    },[account,currentPage,perPage,isLoading,hasPage,dispatchPageAction]);

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

        const state =  pageState[account].statuses[currentPage];
        if( ! state ){
            return [];
        }
        return state.map(itemToPost);
    },[pageState,account]);

    const rows = React.useMemo< {
		key:string,
		cells: {
			key:string,
			Render:() => React.ReactNode,
			className?:string
		}[]
	}[]>(() => {
        if(! posts || posts.length === 0 ){
            return [];
        }
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
        <div>
            {! posts || posts.length === 0 ? <p>No items</p> : <div>
                <TablePagination
                    hasNext={hasNextPage}
                    hasPrev={hasPrevPage}
                    onClickNext={setNextPage}
                    onClickPrev={setPrevPage}
                    displayingNum={posts.length}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    goToPage={setCurrentPage}
                />

                <div>
                    <Table
                        headers={headers}
                        rows={rows}
                        caption={`Items from ${account}`}
                    />

                </div>


            </div>}
            {isLoading && <Spinner/>}
        </div>
    )
}

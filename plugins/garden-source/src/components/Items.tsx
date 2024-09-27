import React from "react";
import { Accounts } from "../types";
import fetchItems from "./api/fetchItemts";
import Table, { TablePagination } from "./Table";
type UIItem = {
    uuid: string;
    content: string;
    source: string;
    sourceType: string;
}

const headers = [
    {
        id: 'uuid',
        children: 'UUID'
    },
    {
        id: 'content',
        children: 'Content'
    },
    {
        id: 'source',
        children: 'Source'
    },
    {
        id: 'sourceType',
        children: 'Source Type'
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
            fetchItems({page,perPage,search:undefined,sourceType:showAll ? undefined : account})
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
    const posts = React.useMemo(() => {
        if( showAll ){
            return items.items;
        }
        return items[account];
    },[showAll,items,account]);

    const rows = React.useMemo< {
		key:string,
		cells: {
			key:string,
			children:React.ReactNode,
			className?:string
		}[]
	}[]>(() => {

        return posts.map((post) => {
            return {
                key: post.uuid,
                cells: [
                    {
                        key: 'uuid',
                        children: post.uuid
                    },
                    {
                        key: 'content',
                        children: post.content
                    },
                    {
                        key: 'source',
                        children: post.source
                    },
                    {
                        key: 'sourceType',
                        children: post.sourceType
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
                <Table
                headers={headers}
                rows={rows}
                caption={`Items from ${account}`}
            />
                <TablePagination currentPage={page} totalPages={1} displayingNum={posts.length}  />
            </div>}
        </>
    )
}

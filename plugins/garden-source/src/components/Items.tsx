import React from "react";
import { Accounts } from "../types";
import fetchItems from "./api/fetchItemts";
type UIItem = {
    uuid: string;
    content: string;
    source: string;
    sourceType: string;
}
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
    if( ! posts || posts.length === 0 ){
        return <p>No items</p>
    }
    return (
        <ul>
            {posts.map((item) => {
                return <li key={item.uuid}>{item.content}</li>
            })}
        </ul>
    )
}

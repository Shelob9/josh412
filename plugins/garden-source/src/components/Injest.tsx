import { Spinner } from "@wordpress/components";
import React from "react";
import { accounts } from "../accounts";
import { Accounts } from "../types";
import { CreatedItem, fetchInjestItems } from "./api/fetchItemts";
import Table from "./Table";
import { AccountDetailsMinimal } from "./Timeline";
export default function Injest({account}:{
    account: Accounts
}) {
    const ranOnce = React.useRef(false);
    const [createdItems,setCreatedItems] = React.useState<{
        fosstodon: CreatedItem[];
        mastodonSocial: CreatedItem[];
        bluesky: CreatedItem[];
    }>({
        fosstodon: [],
        mastodonSocial: [],
        bluesky: [],
    });
    const [nextCursor,setNextCursor] = React.useState<string|undefined>(undefined);
    const accountDetails = React.useMemo(() => {
        return accounts[account] as AccountDetailsMinimal;;
    }, [account]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [clicked,setClicked] = React.useState(false);
    const [clickedInjestAll,setClickedInjestAll] = React.useState(false);
    const isDone = React.useMemo(() => {
        return ranOnce.current && ! nextCursor;
    },[nextCursor]);

    React.useEffect(() => {
        if( ! clicked || isLoading || isDone ){
            return;
        }
        setIsLoading(true);
        fetchInjestItems({
            account:accountDetails,
            cursor: nextCursor
        }).then(({nextCursor,items}) => {
            console.log(nextCursor);
            if(items){
                setCreatedItems((prev) => {
                    const update = {...prev};
                    //put new first
                    update[account] = [
                        ...items,
                        ...update[account]
                    ];
                    return update;
                });
            }

            if(nextCursor){
                setNextCursor(nextCursor as string);
            }else{
                setNextCursor(undefined);
            }

        }).finally(() => {
            setClicked(false);
            setIsLoading(false);
            ranOnce.current = true;
        });
    }, [clicked,isLoading,accountDetails,nextCursor,isDone]);

    React.useEffect(() => {
        if(clickedInjestAll){
            if(isDone){
                setClickedInjestAll(false);
            }else{
                if( ! clicked && ! isLoading ){
                    setClicked(true);
                }
            }

        }
    },[clickedInjestAll,isDone,clicked,isLoading]);

    React.useEffect(() => {
        //when nextCursor changes, put in local storage
        if( nextCursor ){
            localStorage.setItem(`nextCursorInjest${account}`,nextCursor);
        }else{
            localStorage.removeItem(`nextCursorInjest${account}`);
        }
    },[nextCursor,account]);

    //when account changes, if we have a nextCursor in local storage, set it
    React.useEffect(() => {
        const savedNextCursor = localStorage.getItem(`nextCursorInjest${account}`);
        if( savedNextCursor ){
            setNextCursor(savedNextCursor);
        }
    },[account]);



    if( ! accountDetails || ! accountDetails.name ){
        return null;
    }

    return (
        <div>
            {isDone ?<strong>Done With Injest</strong>:(<div>
                <button onClick={() => {
                    setClicked(true);
                }}>
                    Injest {accountDetails.name} {nextCursor ? `nextCursor: ${nextCursor}` : ''}
                </button>
                <button
                    onClick={() => {
                        setClickedInjestAll(true);
                    }}

                >
                    Injest All
                </button>

            </div>)}
            {isLoading ? <Spinner />: null}
            {createdItems[account].length ?(<Table
                headers={[{
                    id: 'uuid',
                    children: 'uuid'
                },{
                    id: 'created',
                    children: 'created'
                },{
                    id: 'remoteId',
                    children: 'remoteId'
                }]}
                caption="Created Items"
                rows={[
                    ...createdItems[account].map((item) => {
                        return {
                            key: item.uuid,
                            cells: [
                                {
                                    key: 'uuid',
                                    Render:  () =>    item.uuid
                                },
                                {
                                    key: 'created',
                                    Render: () => item.created ? 'YES' : 'No'
                                },
                                {
                                    key: 'remoteId',
                                    Render: () => item.remoteId
                                }
                            ]
                        }
                    })
                ]}
            />): null}
        </div>
    )

}

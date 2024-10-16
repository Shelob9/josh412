import { Spinner } from "@wordpress/components";
import React, { useMemo } from "react";
import { accounts } from "../accounts";
import { Accounts } from "../types";
import dataFetch from "./api/dataFetch";
import { CreatedItem, fetchInjestItems } from "./api/fetchItemts";
import Table from "./Table";
import { AccountDetailsMinimal } from "./Timeline";
const  { apiUrl,token } : {
    apiUrl: string;
    token: string;
}
//@ts-ignore
= window.GARDEN || {
    apiUrl: '',
    token: '',
};
function useClassifications({account}:{
    account: Accounts
}){
    const [classifyPage,setClassifyPage] = React.useState(0);
    const [totalClasified,setTotalClassified] = React.useState({
        mastodonSocial: 0,
        fosstodon: 0,
        bluesky: 0,
    });
    const [totalPages,setTotalPages] = React.useState({
        mastodonSocial: 0,
        fosstodon: 0,
        bluesky: 0,
    });
    const [pagesClassified,setPagesClassified] = React.useState<{[key:number]:boolean}>({
        0: false,
        1: false,
    });
    const isDone = useMemo(() => {
        return pagesClassified[totalPages[account]] && true === pagesClassified[totalPages[account]];
    },[totalPages,totalClasified,account]);
    //when accoutn changes, empty pagesClassified
    React.useEffect(() => {
        setPagesClassified({
            0: false,
            1: false,
        });
    },[account]);
    React.useEffect(() => {
        dataFetch(`/classifications`)
            .then(r => r.json())
            .then((r) => {
                console.log({
                    classifications: r
                });
            });
        dataFetch(`/classifications?itemType=${account}`)
            .then(r => r.json())
            .then((r) => {
                console.log({
                    account: r
                });
            });
    },[account]);
    React.useEffect(() => {

        if(classifyPage && false === pagesClassified[classifyPage]){
            dataFetch(`/classifications/process/${account}`,{
                method: 'POST',
                body: JSON.stringify({
                    page: classifyPage
                }),
            }).then(r =>r.json())
            .then((r) => {
                console.log(r);
                setPagesClassified((prev) => {
                    return {
                        ...prev,
                        [classifyPage]: true
                    }
                });
                setTotalClassified((prev) => {
                    return {
                        ...prev,
                        [account]: r.created
                    }
                });
                setTotalPages((prev) => {
                    return {
                        ...prev,
                        [account]: r.totalPages
                    }
                });

            });
        }
    },[classifyPage,account,pagesClassified]);


    function classifyNext(){
        setClassifyPage(classifyPage + 1);
        setPagesClassified((prev) => {
            return {
                ...prev,
                [classifyPage + 1]: false
            }
        });
    }


    return {
        classifyNext,
        totalClasified,
        isDone,
        totalPages,
        classifyPage,
    }
}
export default function Injest({account}:{
    account: Accounts
}) {
    const {
        classifyNext,
        totalClasified,
        isDone:isClassifyDone,
        totalPages: totalClassifyPages,
        classifyPage,
    } = useClassifications({account});

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


    function onResetInjest(){
        localStorage.removeItem(`nextCursorInjest${account}`)
        setNextCursor(undefined);
        setCreatedItems({
            ...createdItems,
            [account]: []
        });

    }

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
                <button onClick={onResetInjest}>
                    Reset Injest
                </button>

            </div>)}
            {isLoading ? <Spinner />: null}
            <div>
                {isClassifyDone ? <strong>Done With Classifications</strong>:(
                    <>
                        <button
                            onClick={classifyNext}
                        >
                            Classify {accountDetails.name}
                        </button>
                        <p>Classified {accountDetails.name}: {totalClasified[account]}</p>
                        <p>Classified page: {classifyPage} of {totalClassifyPages[account]}</p>
                    </>
                )}
            </div>
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

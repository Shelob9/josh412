import React from "react";
import { accounts } from "../accounts";
import { Accounts } from "../types";
import { AccountDetailsMinimal } from "./Timeline";
import { CreatedItem, fetchInjestItems } from "./api/fetchItemts";
export default function Injest({account}:{
    account: Accounts
}) {
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

    React.useEffect(() => {
        if( ! clicked || isLoading ){
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
                    return {
                        ...prev,
                        [account]: [
                            ...prev[account],
                            ...items
                        ]
                    }
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
        });
    }, [clicked,isLoading,accountDetails,nextCursor]);

    if( ! accountDetails || ! accountDetails.name ){
        return null;
    }

    return (
        <div>
            <button onClick={() => {
                setClicked(true);
            }}>
                Injest {accountDetails.name} {nextCursor ? `nextCursor: ${nextCursor}` : ''}
            </button>
            {createdItems[account].length ?(<table>
                <thead>
                    <tr>
                        <th>uuid</th>
                        <th>created</th>
                        <th>remoteId</th>
                    </tr>
                </thead>
                <tbody>
                    {createdItems[account].map((item) => {
                        return (
                            <tr key={item.uuid}>
                                <td>{item.uuid}</td>
                                <td>{item.created ?'YES':'No'}</td>
                                <td>{item.remoteId}</td>
                            </tr>
                        )
                    })}

                </tbody>
            </table>): null}
        </div>
    )

}

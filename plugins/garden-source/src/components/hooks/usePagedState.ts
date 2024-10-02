import { useCallback, useReducer } from 'react';
import { Accounts } from "../../types";

type PagedState<Mt,Bt> = {
    mastodonSocial: {
        currentPage: number,
        statuses: {[key: number]: Mt[]},
    },
    fosstodon: {
        currentPage: number,
        statuses: {[key: number]: Mt[]},
    },
    bluesky: {
        currentPage: number,
        statuses: {[key: number]: Bt[]},
    }
}
type PagedStateAction<Mt,Bt> =
     {
        account: Omit<Accounts,'bluesky'>,
        statuses: Mt[],
        page: number,
    }|{
        account: 'bluesky',
        statuses: Bt[],
        page: number,
    }|{
        account: Accounts,
        reset: true
    }



function pagedStateReducer<Mt,Bt> (state:PagedState<Mt,Bt>,action:PagedStateAction<Mt,Bt>):PagedState<Mt,Bt>{
    if( 'reset'in action ){
        return {
            ...state,
            [action.account]: {
                currentPage: 0,
                statuses: {}
            }
        }
    }else{
        switch (action.account) {
            case 'bluesky':
                return {
                    ...state,
                    ['bluesky']: {
                        currentPage: action.page,
                        statuses: {
                            ...state['bluesky'].statuses,
                            [action.page]: action.statuses as Bt[]
                        }
                    }
                }

            case 'fosstodon':
            case 'mastodonSocial':
            default:
                return {
                    ...state,
                    [action.account as Accounts]: {
                        currentPage: action.page,
                        statuses: {
                            ...state[action.account as Accounts].statuses,
                            [action.page]: action.statuses,
                        }
                    }
                }
        }
    }

}
export default function usePagedState<Mt,Bt>({account}:{
    account: Accounts,
}){

    const [pageState,dispatchPageAction] = useReducer(pagedStateReducer<Mt,Bt>,{
        mastodonSocial: {
            currentPage: 0,
            statuses: {}
        },
        fosstodon: {
            currentPage: 0,
            statuses: {}
        },
        bluesky: {
            currentPage: 0,
            statuses: {}
        }
    });

    const getPageOfState = useCallback((page:number) => {
        return pageState[account].statuses[page] || [];
    },[pageState,account]);

    const hasPage = useCallback((page:number) => {
        return pageState[account].statuses[page] !== undefined;
    },[pageState,account]);

    return {
        pageState,
        dispatchPageAction: dispatchPageAction,
        getPageOfState,
        hasPage,
    }

}

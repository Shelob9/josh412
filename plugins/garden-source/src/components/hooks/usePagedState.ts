import { useCallback, useMemo, useReducer } from 'react';
import { Accounts } from "../../types";

type PagedStateSet<T> = {
    currentPage: number,
    totalPages: number,
    statuses: {[key: number]: T[]},
}
type PagedState<Mt,Bt> = {
    mastodonSocial: PagedStateSet<Mt>,
    fosstodon: PagedStateSet<Mt>,
    bluesky: PagedStateSet<Bt>,
    args: {
        perPage: number
    }
}
type PagedStateAction<Mt,Bt> =
     {
        account: Omit<Accounts,'bluesky'>,
        statuses: Mt[],
        page: number,
        totalPages: number
    }|{
        account: 'bluesky',
        statuses: Bt[],
        page: number,
        totalPages: number
    }|{
        account: Accounts,
        reset: true
    } | {
        setPage: number,
        account: Accounts
    } | {
        perPage: number,
    }


const accountDefaultState =  {
    currentPage: 1,
    totalPages: 0,
    statuses: {}
};
function pagedStateReducer<Mt,Bt> (state:PagedState<Mt,Bt>,action:PagedStateAction<Mt,Bt>):PagedState<Mt,Bt>{
    if( 'reset'in action ){
        return {
            ...state,
            [action.account]: accountDefaultState,
        }
    }else if( 'perPage' in action ){
        return {
            ...state,
            bluesky:  accountDefaultState,
            mastodonSocial:  accountDefaultState,
            fosstodon:  accountDefaultState,

            args: {
                perPage: action.perPage
            }
        }
    }else if( 'setPage' in action ){
        return {
            ...state,
            [action.account]: {
                ...state[action.account],
                currentPage: action.setPage
            }
        }
    }else{
        switch (action.account) {
            case 'bluesky':
                return {
                    ...state,
                    ['bluesky']: {
                        ...state['bluesky'],
                        totalPages: action.totalPages,
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
                        ...state[action.account as Accounts],
                        totalPages: action.totalPages,
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
        mastodonSocial: accountDefaultState,
        fosstodon: accountDefaultState,
        bluesky: accountDefaultState,
        args: {
            perPage: 25
        },
    });

    const getPageOfState = useCallback((page:number) => {
        return pageState[account].statuses[page] || [];
    },[pageState,account]);

    const hasPage = useCallback((page:number) => {
        return pageState[account].statuses[page] !== undefined;
    },[pageState,account]);


    const currentPage = useMemo(() => pageState[account].currentPage,[pageState,account]);

    const setCurrentPage = useCallback((page:number) => {
        dispatchPageAction({
            setPage: page,
            account
        });
    },[dispatchPageAction,account]);

    const setPerPage = useCallback((perPage:number) => {
        dispatchPageAction({
            perPage
        });
    },[dispatchPageAction]);

    const perPage = useMemo(() => pageState.args.perPage,[pageState]);

    const totalPages = useMemo(() => pageState[account].totalPages,[pageState,account]);
    return {
        pageState,
        dispatchPageAction: dispatchPageAction,
        getPageOfState,
        hasPage,
        currentPage,
        setCurrentPage,
        setPerPage,
        perPage,
        totalPages,
    }

}

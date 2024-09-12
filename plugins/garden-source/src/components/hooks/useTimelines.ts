import { useMemo, useReducer } from 'react';
import { Accounts } from '../../types';
import { BskyPostSimple } from '../bluesky';

export type AccountPageState<T> = {
    currentPage: 0,
    statuses: {[key: number]: {
        cursor?: string|undefined;
        statuses: T[]
    }},
}
export type pageState = {
    mastodonSocial:AccountPageState<any>;
    fosstodon: AccountPageState<any>;
    bluesky: AccountPageState<BskyPostSimple>;
}

export type SelectorFns = {
    pageHasStatuses: (index:number) => boolean;
    cursorHasStatuses: (cursor:string|undefined) => boolean;
    findIndexByByCursor: (cursor:string|undefined) => number;
    hasNextPage: () => boolean;
    hasPage: (page:number) => boolean;
    hasPageByCursor: (cursor:string|undefined) => boolean;
    getCurrentCursor: () => string|undefined;
}
export const createSelectors = (state:pageState,account:Accounts):SelectorFns => {

    const findIndexByByCursor = (cursor:string|undefined): number =>{
        if( undefined === cursor ){
            return 0;
        }
        return Object.keys(state[account].statuses).findIndex((key) => {
            return state[account].statuses[key].cursor === cursor;
        });
    }
    function pageHasStatuses(index:number): boolean{
        if( ! state[account].statuses[index] ){
            return false;
        }
        if( ! state[account].statuses[index].statuses ){
            return false;
        }
        return  state[account].statuses[index].statuses.length ? true : false;
    }

    function cursorHasStatuses(cursor:string|undefined): boolean{
        const index = findIndexByByCursor(cursor);
        return pageHasStatuses(index);
    }

    return {
        pageHasStatuses,
        cursorHasStatuses,
        findIndexByByCursor,
        hasNextPage(): boolean{
            return !! state[account].statuses[state[account].currentPage + 1];
        },
        hasPage(page:number): boolean{
            return !! state[account].statuses[page];
        },
        hasPageByCursor(cursor:string|undefined): boolean{
            if( undefined === cursor ){
                return pageHasStatuses(0);
            }
            const index = findIndexByByCursor(cursor);
            if( -1 === index ){
                return false;
            }
            return pageHasStatuses(index);
        },
        getCurrentCursor(): string|undefined{
            if(! state[account].statuses[state[account].currentPage] ){
                return undefined;
            }
            return state[account].statuses[state[account].currentPage].cursor;
        }
    }
};
export type Page_State_Actions = {
    account: Omit<Accounts,'bluesky'>,
    newCursor?: string;
    nextCursor?: string;
    statuses: any[];
}|{
    account: 'bluesky'
    newCursor?: string;
    nextCursor?: string;
    statuses: BskyPostSimple[];
}| {
    account: Omit<Accounts,'bluesky'>
    setPage: number;
}|{
    account: 'bluesky'
    setPage: number;
}|{
    account: Accounts
    clear: true;
};

export function pageReducer( state: pageState,action: Page_State_Actions ): pageState{
    const actionAccount = action.account as string;
    if( 'clear' in action ){
        return {
            ...state,
            [actionAccount]: {
                currentPage: 0,
                statuses: {0: {
                    cursor: undefined,
                    statuses: []
                }}
            }
        }
    }
    if( 'setPage' in action ){
        //find cursor for that page and set it as current cursor

        return {
            ...state,
            [actionAccount]: {
                ...state[actionAccount],
                currentPage: action.setPage,
            }
        }
    }
    if( undefined === action.newCursor ){
        const statuses = {
            ...state[actionAccount].statuses,
            [0]: {
                cursor: undefined,
                statuses: action.statuses
            }
        }
        if(action.nextCursor && ! state[actionAccount].statuses[1]){
            statuses[1] =  {
                cursor: action.nextCursor,
                statuses: []
            }
        }
        return {
            ...state,
            [actionAccount]: {
                ...state[actionAccount],
                statuses
            }
        }
    }else{
        let newState = {
            ...state,
        }

        //find index of action.newCursor in cursors
        Object.keys(state[actionAccount].statuses).forEach((key) => {
            if( state[actionAccount].statuses[key].cursor === action.newCursor ){
                const nextIndex = parseInt(key,10) + 1;
                newState = {
                    ...newState,
                    [actionAccount]: {
                        ...newState[actionAccount],
                        statuses: {
                            ...newState[actionAccount].statuses,
                            [key]: {
                                ...newState[actionAccount].statuses[key],
                                statuses: action.statuses
                            },
                            [nextIndex]: newState[actionAccount].statuses[nextIndex] ? {
                                cursor: action.nextCursor,
                                statuses: newState[actionAccount].statuses[nextIndex].statuses,
                            } : {
                                cursor: action.nextCursor,
                                statuses: []
                            }
                        }
                    }
                }

            }
        });
        return newState;

    }
    return state;
}



export const defaultPageState :pageState = {

        mastodonSocial: {
            currentPage: 0,
            statuses: {0: {
                cursor: undefined,
                statuses: []
            }}
        },
        fosstodon: {
            currentPage: 0,
            statuses: {0: {
                cursor: undefined,
                statuses: []
            }}
        },
        bluesky: {
            currentPage: 0,
            statuses: {0: {
                cursor: undefined,
                statuses: []
            }}
        }
    };

export type TimelineStateApi =
    SelectorFns & {
        pageState: pageState;
        currentCursor: string|undefined;
        dispatchPageAction: (action:Page_State_Actions) => void;
    }
function useTimelines({account}:{
    account: Accounts,
}): TimelineStateApi {
    const [pageState,dispatchPageAction] = useReducer(pageReducer,defaultPageState);

    const selectors = useMemo(() => {
        return createSelectors(pageState,account);
    },[pageState,account]);

    const currentCursor = useMemo(() => {
        return selectors.getCurrentCursor();
    },[selectors]);

    return {
        ...selectors,
        pageState,
        currentCursor,
        dispatchPageAction
    }
}

export default useTimelines;

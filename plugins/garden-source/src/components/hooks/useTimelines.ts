import { useMemo, useReducer } from 'react';
import { Accounts } from '../../types';
import { BskyPostSimple } from '../bluesky';


export type pageState = {
    mastodonSocial: {
        currentPage: 0,
        statuses: {[key: number]: {
            cursor?: string|undefined;
            statuses: any[];
        }},
    },
    fosstodon: {
        currentPage: 0,
        statuses: {[key: number]: {
            cursor?: string|undefined;
            statuses: any[];
        }},
    },
    bluesky: {
        currentPage: 0,
        statuses: {[key: number]: {
            cursor?: string|undefined;
            statuses: BskyPostSimple[];
        }},
    }
}

const createSelectors = (state:pageState,account:Accounts) => {

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
            return state[account].statuses[state[account].currentPage].cursor;
        }
    }
};
type Actions = {
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
};

//0 is regular, 1 is search
type pageStates = {
    0: pageState;
    1: pageState;
}


function pageReducer( state: pageState,action: Actions ): pageState{
    const actionAccount = action.account as string;
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

function multiPageReducer(state: pageStates,action:{
    mode: 0|1;
    action: Actions;
}): pageStates{

   return {
    ...state,
    [action.mode]: pageReducer(state[action.mode],action.action)
   }
}

const defaultPageState :pageState = {

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
function useTimeLinesWithSearch({account}:{
    account: Accounts,
}){
    const [pagesState,dispatchPagesAction] = useReducer(multiPageReducer,{
        0: defaultPageState,
        1: defaultPageState,
 } );

    const selectors = useMemo(() => {
        return createSelectors(pagesState[0],account);
    },[pagesState[0],account]);
    const searchSelectors = useMemo(() => {
        return createSelectors(pagesState[1],account);
    },[pagesState[1],account]);
    const currentCursor = useMemo(() => {
        return selectors.getCurrentCursor();
    },[selectors]);

    const currentSearchCursor = useMemo(() => {
        return searchSelectors.getCurrentCursor();
    },[searchSelectors]);

    return {
        ...selectors,
        pageState: pagesState[0],
        currentCursor,
        dispatchPageAction: (action:Actions) => {
            dispatchPagesAction({
                mode: 0,
                action
            });
        },
        dispatchSearchAction: (action:Actions) => {
            dispatchPagesAction({
                mode: 1,
                action
            });
        },
        currentSearchCursor,
    }
}

function useTimelines({account}:{
    account: Accounts,
}){
    const [pageState,dispatchPageAction] = useReducer(pageReducer,defaultPageState);

    const selectors = useMemo(() => {
        return createSelectors(pageState,account);
    },[pageState,account]);

    const currentCursor = useMemo(() => {
        return selectors.getCurrentCursor();
    },[selectors]);
    console.log({
        account,
        pageState,
        currentCursor
    })
    return {
        ...selectors,
        pageState,
        currentCursor,
        dispatchPageAction
    }
}

export default useTimelines;

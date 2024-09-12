import { useMemo, useReducer } from 'react';
import { Accounts, See } from "../../types";
import { createSelectors, defaultPageState, Page_State_Actions, pageReducer, TimelineStateApi } from "./useTimelines";
type AccountReducers = {
    search: TimelineStateApi;
    statuses:TimelineStateApi;
    likes: TimelineStateApi;
    timeline: TimelineStateApi;
}


export default function useSearchApis(){
    const reducers = useMemo(() => {
        return {
            timelines: useReducer(pageReducer,defaultPageState),
            likes : useReducer(pageReducer,defaultPageState),
            statuses : useReducer(pageReducer,defaultPageState),
            search : useReducer(pageReducer,defaultPageState),
        }
    },[]);


    function dispatchAction({action,type}:{
        action:Page_State_Actions;
        type: See|'search',
    }){
        return reducers[type][1](action);
    }





    function select({ account, type }: { account: Accounts; type: See|'search', }) {
        const state=  reducers[type][0];
        console.log({state,account, type})
        const selectorFns = createSelectors(state, account);

        return {
            hasPage: (page: number) => selectorFns.hasPage(page),
            hasNextPage: () => selectorFns.hasNextPage(),
            hasPageByCursor: (cursor: string) => selectorFns.hasPageByCursor(cursor),
            getCurrentCursor: () => selectorFns.getCurrentCursor(),
            pageHasStatuses: (index: number) => selectorFns.pageHasStatuses(index),
            cursorHasStatuses: (cursor: string) => selectorFns.cursorHasStatuses(cursor),
            findIndexByByCursor: (cursor: string) => selectorFns.findIndexByByCursor(cursor),
            getStatuses: () => {
                const page = state[account].currentPage;
                return state[account].statuses[page]?.statuses;
            }

        };
    }

    return {
        dispatchAction,
        select,
    }
}

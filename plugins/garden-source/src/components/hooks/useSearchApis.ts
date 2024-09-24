import { useMemo } from 'react';
import { Accounts, See } from "../../types";
import useTimelines, { Page_State_Actions, SelectorFns, TimelineStateApi } from "./useTimelines";
type AccountReducers = {
    search: TimelineStateApi;
    statuses:TimelineStateApi;
    likes: TimelineStateApi;
    timeline: TimelineStateApi;
}

type Reducers = {
    mastodonSocial: AccountReducers;
    fosstodon: AccountReducers;
    bluesky: AccountReducers;
}
export default function useSearchApis(){


    const reducers  = useMemo<Reducers>(() => {
        return {
            mastodonSocial: {
                search: useTimelines({account:'mastodonSocial'}),
                statuses: useTimelines({account:'mastodonSocial'}),
                likes: useTimelines({account:'mastodonSocial'}),
                timeline: useTimelines({account:'mastodonSocial'}),
            },
            fosstodon: {
                search: useTimelines({account:'fosstodon'}),
                statuses: useTimelines({account:'fosstodon'}),
                likes: useTimelines({account:'fosstodon'}),
                timeline: useTimelines({account:'fosstodon'}),

            },
            bluesky: {
               search: useTimelines({account:'bluesky'}),
                statuses: useTimelines({account:'bluesky'}),
                likes: useTimelines({account:'bluesky'}),
                timeline: useTimelines({account:'bluesky'}),
            }
        }
    },[]);

    function dispatchAction({action,account,type}:{
        action:Page_State_Actions;
        account:Accounts
        type: See|'search',
    }){
        return reducers[account][type].dispatchPageAction(action);
    }

    function getState({account,type}:{
        account:Accounts
        type: See|'search',
    }){
        return reducers[account][type].pageState;
    }

    function selectors({account,type}): SelectorFns{
        const { pageHasStatuses, cursorHasStatuses, findIndexByByCursor, hasNextPage, hasPage, hasPageByCursor, getCurrentCursor } = reducers[account][type];
        return {
            pageHasStatuses,
            cursorHasStatuses,
            findIndexByByCursor,
            hasNextPage,
            hasPage,
            hasPageByCursor,
            getCurrentCursor
        }
    }

    function getPage({account,type}:{account:Accounts,type:See|'search',}):number{
        return this.getState({account,type}).currentPage;
    }

    function select({ account, type }: { account: string; type: string }) {
        const selectorFns = selectors({ account, type });

        return {
            hasPage: (page: number) => selectorFns.hasPage(page),
            hasNextPage: () => selectorFns.hasNextPage(),
            hasPageByCursor: (cursor: string) => selectorFns.hasPageByCursor(cursor),
            getCurrentCursor: () => selectorFns.getCurrentCursor(),
            pageHasStatuses: (index: number) => selectorFns.pageHasStatuses(index),
            cursorHasStatuses: (cursor: string) => selectorFns.cursorHasStatuses(cursor),
            findIndexByByCursor: (cursor: string) => selectorFns.findIndexByByCursor(cursor),


        };
    }

    return {
        dispatchAction,
        getState,
        select,
        getPage
    }
}

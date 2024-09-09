import { Accounts } from "../../types";
import useTimelines from "./useTimelines";

export default function useTimeLinesWithSearch({account,searchMyPostsOnly}:{
    account: Accounts,
    searchMyPostsOnly:boolean
}){
    const {
        pageHasStatuses,
        cursorHasStatuses,
        findIndexByByCursor,
        hasNextPage,
        hasPage,
        hasPageByCursor,
        getCurrentCursor,
        pageState,
        currentCursor,
        dispatchPageAction
    } = useTimelines({account});

    //Used instead of search state when searchMyPostsOnly
    const allSearch = useTimelines({account});
    const {
        pageHasStatuses: searchPageHasStatuses,
        cursorHasStatuses: searchCursorHasStatuses,
        findIndexByByCursor: searchFindIndexByByCursor,
        hasNextPage: searchHasNextPage,
        hasPage: searchHasPage,
        hasPageByCursor: searchHasPageByCursor,
        getCurrentCursor: searchGetCurrentCursor,
        pageState: searchPageState,
        currentCursor: currentSearchCursor,
        dispatchPageAction: dispatchSearchAction
    } = useTimelines({account});
    return {
        pageHasStatuses,
        cursorHasStatuses,
        findIndexByByCursor,
        hasNextPage,
        hasPage,
        hasPageByCursor,
        getCurrentCursor,
        pageState,
        currentCursor,
        dispatchPageAction,
        dispatchSearchAction: searchMyPostsOnly ? dispatchSearchAction : allSearch.dispatchPageAction,
        currentSearchCursor,
        searchPageHasStatuses:(index:number) => {
            if( searchMyPostsOnly ){
                return searchPageHasStatuses(index);
            }
            return allSearch.pageHasStatuses(index);
        },
        searchCursorHasStatuses:(cursor:string|undefined) => {
            if( searchMyPostsOnly ){
                return searchCursorHasStatuses(cursor);
            }
            return allSearch.cursorHasStatuses(cursor);
        },
        searchFindIndexByByCursor:(cursor:string|undefined) => {
            if( searchMyPostsOnly ){
                return searchFindIndexByByCursor(cursor);
            }
            return allSearch.findIndexByByCursor(cursor);
        },
        searchHasNextPage:(cursor:string|undefined) => {
            if( searchMyPostsOnly ){
                return searchHasNextPage(cursor);
            }
            return allSearch.hasNextPage();
        },
        searchHasPage:(page:number) => {
            if( searchMyPostsOnly ){
                return searchHasPage(page);
            }
            return allSearch.hasPage(page);
        },
        searchHasPageByCursor:(cursor:string|undefined) => {
            if( searchMyPostsOnly ){
                return searchHasPageByCursor(cursor);
            }
            return allSearch.hasPageByCursor(cursor);
        },
        searchGetCurrentCursor:() => {
            if( searchMyPostsOnly ){
                return searchGetCurrentCursor();
            }
            return allSearch.getCurrentCursor();
        },
        searchPageState: searchMyPostsOnly ? searchPageState : allSearch.pageState,
    }
}

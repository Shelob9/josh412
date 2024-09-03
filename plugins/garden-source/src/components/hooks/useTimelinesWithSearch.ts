import { Accounts } from "../../types";
import useTimelines from "./useTimelines";

export default function useTimeLinesWithSearch({account}:{
    account: Accounts,
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

    const mineOnlySearch = useTimelines({account});

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
        dispatchSearchAction,
        currentSearchCursor,
        searchPageHasStatuses,
        searchCursorHasStatuses,
        searchFindIndexByByCursor,
        searchHasNextPage,
        searchHasPage,
        searchHasPageByCursor,
        searchGetCurrentCursor,
        searchPageState,
        mineOnlySearch,
    }
}

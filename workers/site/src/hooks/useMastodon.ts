

import { Status } from "@app/types/mastodon";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";


export function useMastodon({
  name,
  accountId
}:{
  name: string;
  accountId: string;
}) {
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [prevCursor, setPrevCursor] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  ///search/mastodon/425078/statuses
  const queryKey= ["search","mastodon",accountId,"statuses",cursor]
  return {
    canNext: !!nextCursor,
    canPrev: !!prevCursor,
    loadPrev: () => {
      setCursor(prevCursor);
    },
    loadNext: () => {
      setCursor(nextCursor);
    },
    ...useQuery({
      queryKey: ["search","mastodon",accountId,"statuses",cursor],
      queryFn: async () => {
        const url = `/search/mastodon/${accountId}/statuses${cursor ? `?${cursor}` : ''}`;
        const response = await fetch(url);
        const result = await response.json() as {
          cursor: string | null;
          statuses: Status[];
        };
        if( result.cursor ){
          setNextCursor(result.cursor);
          if( cursor ){
            setPrevCursor(cursor);
          }
        }
        return result.statuses;
      },
    })
  };

}

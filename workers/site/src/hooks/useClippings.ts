

import { Clipping } from "@app/types";
import { useQuery } from "@tanstack/react-query";



export function useClippings() {
  return useQuery({
    queryKey: ["clippings"],
    queryFn: async () => {
      const url = "/api/clippings";
      const response = await fetch(url);
      const result: Clipping[] = await response.json();
      return result;
    },
  });
}

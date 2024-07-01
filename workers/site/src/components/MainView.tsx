

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import ListClippings from "./Clippings/List";

import CreateClipping from "./Clippings/Create";
import Heading from "./Heading/heading";
export default function MainView(){
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 0,
          },
        },
      })
  );
  return (
    <QueryClientProvider client={queryClient}>
        <main className="main">
          <Heading />
          <div>
            <section>
              <div className="border-2 border-primary">
                <CreateClipping />
                </div>
                <ListClippings />
            </section>
          </div>
        </main>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

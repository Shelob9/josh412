

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Fragment, useState } from "react";
import ListClippings from "./Clippings/List";

import CreateClipping from "./Clippings/Create";
import Heading from "./Heading/heading";
import Tabbed from "./Tabbed";
import Mastodon from "./Timeline/Mastodon";
export const accounts = {
  mastodonSocial: {
      type: 'mastodon',
      name:'josh412',
      instanceUrl: 'https://mastodon.social',
      id: '425078',
  },
  fosstodon:{
      type: 'mastodon',
      name: "josh412",
      instanceUrl: 'https://fosstodon.org',
      id: '109276361938539865',
  },
  bluesky: {
      type: 'bluesky',
      name: "josh412.com",
      id: "did:plc:payluere6eb3f6j5nbmo2cwy"
  }
}
export default function MainView(){
  const [currentTab,setCurrentTab] = useState('clippings');
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
            <Tabbed
            current={currentTab}
            setCurrent={setCurrentTab}
              tabs={[
                ...Object.keys(accounts).map((key) => ({

                  key,
                  label: accounts[key].name,
                  children: (
                    <section>
                      <div>
                        {'mastodon' === accounts[key].type ? (
                          <Mastodon name={accounts[key].name} id={accounts[key].id} />
                        ):<Fragment />}
                      </div>
                    </section>
                  ),

              })),
                {
                  key: "clippings",
                  label: "Clippings",
                  children: (
                    <section>
                      <div className="border-2 border-primary">
                        <CreateClipping />
                      </div>
                      <ListClippings />
                    </section>
                  ),
                },
              ]}
            />
          </div>
        </main>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

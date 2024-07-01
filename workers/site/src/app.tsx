

import { lazy } from "react";

const MainView = lazy(() => import("@app/components/MainView"));

function Application() {


  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Example project showing how to deploy your Hono+React(SSR) application to Cloudflare Workers Sites" />
        <title>App</title>
        <link href="/assets/globals.css" rel="stylesheet" />
      </head>
      <body>
        <MainView  />
      </body>
    </html>
  );
}

export default Application;

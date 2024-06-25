const config = {
  cacheSeconds: 604800,
  uri: `https://josh412.com`,
}
import {
  MethodNotAllowedError,
  NotFoundError,
  getAssetFromKV,
  serveSinglePageApp,
} from "@cloudflare/kv-asset-handler";
import assetManifest from "__STATIC_CONTENT_MANIFEST";
import { Hono } from "hono";
import { cache } from "hono/cache";
import { SSRRender } from "src/entry-server";

type Bindings = {
  __STATIC_CONTENT: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

type Data = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};


app
  .get(
    "*",
    cache({
      cacheName: "josh412-cache",
      cacheControl: `max-age=${config.cacheSeconds}`,
    })
  )
  .get("/api/posts", async (c) => {
    const url = "https://jsonplaceholder.typicode.com/posts";
    const response = await fetch(url);
    const result: Data[] = await response.json();
    return c.json(result);
  })
  .get("/assets/*", async (c) => {
    try {
      return await getAssetFromKV(
        {
          request: c.req.raw,
          waitUntil: async (p) => c.executionCtx.waitUntil(p),
        },
        {
          ASSET_NAMESPACE: c.env.__STATIC_CONTENT,
          ASSET_MANIFEST: assetManifest,
          //@ts-ignore
          defaultETag: "strong",
          mapRequestToAsset: serveSinglePageApp,
          cacheControl: {
            browserTTL: undefined,
            edgeTTL: 2 * 60 * 60 * 24,
            bypassCache: true,
          },
        }
      );
    } catch (e) {
      if (e instanceof NotFoundError) {
        throw new Error(e.message);
      } else if (e instanceof MethodNotAllowedError) {
        throw new Error(e.message);
      } else {
        throw new Error("An unexpected error occurred");
      }
    }
  })
  .get("/notes/*", async (c) => c.newResponse(await SSRRender()))
  .notFound((c) =>
    c.json(
      {
        message: "Not Found",
        ok: false,
      },
      404
    )
  )
  //@ts-ignore
  .onError((err, c) => {
    //console.log({err})
    c.json(
      {
        name: err.name,
        message: err.message,
      },
      500
    );
  }

  );

export default {
  fetch: app.fetch,
};

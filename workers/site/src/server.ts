const config = {
  cacheSeconds: 0,
  uri: `https://josh412.com`,
}
import {
  MethodNotAllowedError,
  NotFoundError,
  getAssetFromKV,
  serveSinglePageApp,
} from "@cloudflare/kv-asset-handler";
import a from '@josh412/pkg-a';
import assetManifest from "__STATIC_CONTENT_MANIFEST";
import { Bindings, Variables } from "app.types";
import { Hono } from "hono";
import { bearerAuth } from 'hono/bearer-auth';
import { cache } from "hono/cache";
import { cors } from 'hono/cors';
import { SSRRender } from "src/entry-server";
import api from "./api";
import ui from "./app";
const app  = new Hono<{Variables:Variables,Bindings:Bindings}>();
app
.use(
  '*',
  (c, next) => {
    a();
    const corsed = cors({
        origin: (origin: string) =>  {
          if( '12345' === c.env.TOKEN ) {
            return origin;
          }
          return ''
        },
        maxAge: 600,
        allowMethods: ['GET', 'POST', "DELETE", "PUT", "PATCH", "OPTIONS"],
        credentials: true,
    });
    return corsed(c, next)
  }
)
  .use("*",async (c, next) => {
    if(c.req.path.startsWith('/api/status')|| c.req.path.startsWith('/ui')){
      return next();
    }
    console.log(`[${c.req.method}] ${c.req.url}`)
    const bearer = bearerAuth({ token: [c.env.TOKEN] })
    return bearer(c, next)
  })


  .get(
    "/assets/*",
    cache({
      cacheName: "josh412-cache",
      cacheControl: `max-age=${config.cacheSeconds}`,
    })
  )
  .get("/assets/*", async (c) => {
    try {
      return await getAssetFromKV(
        {
          request: c.req.raw,
          waitUntil: async (p) => c.executionCtx.waitUntil(p),
        },
        {
            //@ts-ignore
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
  .get("/app/*", async (c) => c.newResponse(await SSRRender()))
  .get('/', async (c) => {
    return c.json({
      ok: true,
    });
  })
  .notFound((c) =>
    c.json(
      {
        message: "Not Found",
        ok: false,
        route: '404',
        worker: 'josh412-site'
      },
      404
    )
  )
  //@ts-ignore
  .onError((err, c) => {
    if('object' === typeof err && 'function' === typeof err.getResponse){
      const response = err.getResponse();
      const statusText = response.statusText;
      return new Response(JSON.stringify({message:statusText || 'error'}), {
        status: 401,
        headers: {
          ...response.headers,
          'Content-Type': 'application/json',
        }
      });

    }

    return c.json({error: 'Error'}, 500);

  }

  );

//@ts-ignore
app.route('/api', api );
app.route('/ui', ui );
export default {
  fetch: app.fetch,
};

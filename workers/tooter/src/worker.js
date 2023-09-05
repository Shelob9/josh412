import { feedGeneratorWellKnown, getFeedSkeleton, } from "./bsky-feedgen.js";
import {searchPost} from "./bsky-search.js";

export default {
  async fetch(request, env, ctx) {
    console.clear();
    // lame-o routing
    if (request.url.endsWith("/.well-known/did.json")) {
      return await feedGeneratorWellKnown(request);
    }
    if (request.url.indexOf("/xrpc/app.bsky.feed.getFeedSkeleton") > -1) {
      return await getFeedSkeleton(request, env);
    }
    if( request.url.indexOf("/search") > -1){
      //get q from query string
      const url = new URL(request.url);
      const q = url.searchParams.get("q");
      const results =  await searchPost(q,{
        count: url.searchParams.has("count") ? url.searchParams.get("count") : 30,
        offset: url.searchParams.has("offset") ? url.searchParams.get("offset") : 0,
      });

      return new Response(JSON.stringify({
        results,
        q,
      }));
    }
    return new Response(`{}`);
  },
};

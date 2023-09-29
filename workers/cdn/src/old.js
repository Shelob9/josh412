// src/worker.ts
var worker_default = {
    async fetch(request, env, ctx) {
      const { BUCKET, AUTH_SECRET } = env;
      const url = new URL(request.url);
      const key = url.pathname.slice(1);
      if (request.method === "PUT") {
        const auth = request.headers.get("Authorization");
        const expectedAuth = `Bearer ${AUTH_SECRET}`;
        if (!auth || auth !== expectedAuth) {
          return new Response(JSON.stringify({
            message: "unauthorized",
            auth
          }), {
            status: 401,
            headers: {
              "content-type": "text/json;charset=UTF-8"
            }
          });
        }
        if (!key) {
          return new Response(JSON.stringify({
            message: `Invalid key`,
            url
          }), {
            status: 400,
            headers: {
              "content-type": "text/json;charset=UTF-8"
            }
          });
        }
        try {
          await BUCKET.put(key, request.body);
          return new Response(JSON.stringify({
            message: `Object ${key} uploaded successfully!`,
            key,
            url
          }), {
            status: 201,
            headers: {
              "content-type": "text/json;charset=UTF-8"
            }
          });
        } catch (error) {
          return new Response(JSON.stringify({
            message: "failed",
            key,
            url
          }), {
            status: 502,
            headers: {
              "content-type": "text/json;charset=UTF-8"
            }
          });
        }
      }
      if (!key) {
        const options = {
          limit: 500
        };
        const list = await BUCKET.list(options);
        let truncated = list.truncated;
        let cursor = truncated ? list.cursor : void 0;
        while (truncated) {
          const next = await BUCKET.list({
            ...options,
            cursor
          });
          list.objects.push(...next.objects);
          truncated = next.truncated;
          cursor = next.cursor;
        }
        const images = list.objects.map(
          (item) => {
            return {
              key: item.key,
              uploaded: item.uploaded,
              size: item.size,
              etag: item.etag,
              httpEtag: item.httpEtag,
              url: `${url}${item.key}`
            };
          }
        );
        return new Response(JSON.stringify({
          message: `${list.objects.length} items`,
          images
        }), {
          status: 200,
          headers: {
            "content-type": "text/json;charset=UTF-8"
          }
        });
      }
      const object = await env.BUCKET.get(key);
      if (object === null) {
        return new Response(
          "<h1>Not found</h1>",
          {
            status: 404,
            headers: {
              "content-type": "text/html;charset=UTF-8"
            }
          }
        );
      }
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);
      return new Response(object.body, {
        headers
      });
    }
  };
  export {
    worker_default as default
  };
  //# sourceMappingURL=worker.js.map

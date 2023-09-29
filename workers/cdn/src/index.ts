
interface Env {
  BUCKET: R2Bucket;
  AUTH_SECRET: string;
}

interface Image {
  key: string;
  uploaded: Date;
  size: number;
  etag: string;
  httpEtag: string;
  url: string;
}

interface ListResponse {
  message: string;
  images: Image[];
}

interface ErrorResponse {
  message: string;
  key: string;
  url: URL;
}

interface SuccessResponse {
  message: string;
  key: string;
  url: URL;
}

type ResponseData = ListResponse | ErrorResponse | SuccessResponse;

interface Classification_Source {
  id: string;
  text: string;
  sourcetype: string;
}



const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { BUCKET, AUTH_SECRET } = env;
    const url = new URL(request.url);
    const key = url.pathname.slice(1);
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
    if (request.method === "PUT") {
      const auth = request.headers.get("Authorization");
      const expectedAuth = `Bearer ${AUTH_SECRET}`;
      if (!auth || auth !== expectedAuth) {
        const response: ErrorResponse = {
          message: "unauthorized",
          key,
          url
        };
        return new Response(JSON.stringify(response), {
          status: 401,
          headers: {
            "content-type": "text/json;charset=UTF-8"
          }
        });
      }
      if (!key) {
        const response: ErrorResponse = {
          message: `Invalid key`,
          key,
          url
        };
        return new Response(JSON.stringify(response), {
          status: 400,
          headers: {
            "content-type": "text/json;charset=UTF-8"
          }
        });
      }
      try {
        await BUCKET.put(key, request.body);
        const response: SuccessResponse = {
          message: `Object ${key} uploaded successfully!`,
          key,
          url
        };
        return new Response(JSON.stringify(response), {
          status: 201,
          headers: {
            "content-type": "text/json;charset=UTF-8"
          }
        });
      } catch (error) {
        const response: ErrorResponse = {
          message: "failed",
          key,
          url
        };
        return new Response(JSON.stringify(response), {
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
      //@ts-ignore
      let cursor = truncated ? list.cursor : void 0;
      while (truncated) {
        const next = await BUCKET.list({
          ...options,
          cursor
        });
        list.objects.push(...next.objects);
        truncated = next.truncated;
        //@ts-ignore
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
      const response: ListResponse = {
        message: `${list.objects.length} items`,
        images
      };
      return new Response(JSON.stringify(response), {
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

export default worker;

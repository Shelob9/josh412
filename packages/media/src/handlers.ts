import { putMediaItem,getMediaItem } from "./functions";
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



  export async function handlePut(request: Request, BUCKET: R2Bucket): Promise<Response> {
    const url = new URL(request.url);
    const key = url.pathname.slice(1);

    if (request.method === "PUT") {

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
        const {message} = await putMediaItem(BUCKET, key, request.body);
        return new Response(JSON.stringify({
          message,
          key,
          url
        }), {
          status: 201,
          headers: {
            "content-type": "text/json;charset=UTF-8"
          }
        });

      } catch (error) {
        const response: ErrorResponse = {
          message: error.message,
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
    const response: ErrorResponse = {
      message: `Invalid method ${request.method}`,
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
  export async function handleList(request: Request, BUCKET: R2Bucket): Promise<Response> {
    const url = new URL(request.url);
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




  export async function handleGet(request: Request, BUCKET: R2Bucket): Promise<Response> {
    const url = new URL(request.url);
    const key = url.pathname.slice(1);
    //error unless GET
    if (request.method !== 'GET') {
      return new Response(JSON.stringify({
        message: `<h1>${request.method} Not Allowed</h1>`
      }), {
        status: 405,
        headers: {
          "content-type": "text/html;charset=UTF-8"
        }
      });
    }
    if (!key) {
      return new Response(
        "<h1>No request key</h1>",
        {
          status: 400,
          headers: {
            "content-type": "text/html;charset=UTF-8"
          }
        }
      );


    }
    const object = await getMediaItem(BUCKET,key);
    if (!object) {
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

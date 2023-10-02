
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
    //error unless GET
    if( request.method !== 'GET' ){
      return new Response(JSON.stringify({
        message: `<h1>${request.method} Not Allowed</h1>`
      }), {
        status: 405,
        headers: {
          "content-type": "text/html;charset=UTF-8"
        }
      });
    }
    if( ! key ){
      return new Response(JSON.stringify({
        message: `<h1>Key is required</h1>`
      }), {
        status: 400,
        headers: {
          "content-type": "text/html;charset=UTF-8"
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

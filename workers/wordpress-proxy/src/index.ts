import { isAllowed, isAuthed } from "@lib/allowed";
import config from "@lib/config";
import { withWorkerName } from "@lib/ResponseFactory";
const { cacheSeconds, uri } = config;
const workerName = 'wordpress-proxy';
export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
         // Determine which group this request is in.
         const cookie = request.headers.get('Cookie')
         if ('POST' ===  request.method || isAuthed(cookie)) {
            const bustedRequest = new Request(request, { cf: { cacheTtl: -1 } })
            const response = await fetch(bustedRequest)
            const newHeaders = new Headers(response.headers)
            newHeaders.append('x-josh412-proxy', 'true' )
            newHeaders.append('x-josh412-proxied', 'false')
            return withWorkerName( {
                response: new Response(response.body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: newHeaders
                }),
                workerName
            })
         } else {
            const originalUrl = new URL(request.url);
            const cacheKey = `${originalUrl.hostname}${originalUrl.pathname}${originalUrl.search}`;
            const allowed = isAllowed(originalUrl);
            if( ! allowed ){
                console.log({
                    message: 'not allowed',
                    pathname: originalUrl.pathname,
                    allowed
                })
                //redirect to /404
                return new Response(null, {
                    status: 301,
                    headers: {
                        'Location': `${uri}/404`
                    }
                })
            }
            const newUrl = allowed ? new URL(`${uri}${originalUrl.pathname}`) : new URL(`${uri}/404`);
            const response = await fetch(newUrl, {
                cf: {
                    cacheKey,
                    cacheTtl: cacheSeconds },
                headers: {
                    ...request.headers,
                    'x-josh412-proxy': 'true',
                    'x-josh412-proxied': 'true',
                    'x-josh412-allowed': allowed ? 'true' : 'false',
                    'Cache-Control': `public, max-age=${cacheSeconds}`
                },
           });
            return  withWorkerName( {
                response: new Response(response.body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers
                }),
                workerName: 'wordpress-proxy'
            })
        };
    },
};

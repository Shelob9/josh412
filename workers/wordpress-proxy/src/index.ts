import { isAllowed, isAuthed } from "@lib/allowed";
import config from "@lib/config";
import { withWorkerName } from "@lib/ResponseFactory";
const { cacheSeconds, uri } = config;
const workerName = 'wordpress-proxy';
export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
         // Determine which group this request is in.
         const cookie = request.headers.get('Cookie')
         if (isAuthed(cookie)) {
            const bustedRequest = new Request(request, { cf: { cacheTtl: -1 } })
            const response = await fetch(bustedRequest)
            const newHeaders = new Headers(response.headers)
            newHeaders.append('wp-cache-busted', `true`)
            newHeaders.append('x-proxy', 'true');
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
            const allowed = isAllowed(originalUrl);
            const newUrl = allowed ? new URL(`${uri}${originalUrl.pathname}`) : new URL(`${uri}/404`);
            const response = await fetch(newUrl, {
                cf: { cacheTtl: cacheSeconds },
                headers: {
                    ...request.headers,
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

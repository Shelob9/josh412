import { isAllowed, isAuthed } from "@lib/allowed";
import config from "@lib/config";
const { cacheSeconds, uri } = config;
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
           return new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: newHeaders
           })
         } else {
            const originalUrl = new URL(request.url);
            const allowed = isAllowed(originalUrl);
            const newUrl = allowed ? new URL(`${uri}${originalUrl.pathname}`) : new URL(`${uri}/404`);
            // Edge Cache for 7 days
               return fetch(newUrl, {
                cf: { cacheTtl: cacheSeconds },
                headers: {
                    ...request.headers,
                    'x-proxy': 'true'
                },

             })
         };
    },
};

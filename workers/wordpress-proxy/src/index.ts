const cacheSeconds = 604800
const uri = `https://josh412.com`;

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
         // Determine which group this request is in.
         const cookie = request.headers.get('Cookie')
         if (cookie
           && (
             cookie.includes(`wordpress_logged`)
             || cookie.includes(`comment_`)
             || cookie.includes(`wordpress_sec`)
           )) {
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
            console.log('served from Cached', request.url);

            const originalUrl = new URL(request.url);
            const newUrl = new URL(`${uri}${originalUrl.pathname}`);
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

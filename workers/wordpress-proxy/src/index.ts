import config from "@lib/config";
import { withWorkerName } from "@lib/ResponseFactory";
const { cacheSeconds, uri } = config;
const workerName = 'wordpress-proxy';
export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const bustedRequest = new Request(request, { cf: { cacheTtl: -1 } })
        const response = await fetch(bustedRequest)
        const newHeaders = new Headers(response.headers)
        newHeaders.append('x-josh412-proxy', 'true' )
        newHeaders.append('x-josh412-proxied', 'false')
        newHeaders.append('Cache-Control', 'no-cache, max-age=0')

        return withWorkerName( {
            response: new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: newHeaders,
                cf: { cacheTtl: -1 }
            }),
            workerName
        })
    },
};

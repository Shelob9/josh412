import { DataService, Env } from '@feeder';
import { handlePut } from "@media/handlers";
import { InsertScheduledPost } from "../../../packages/feeder/src/data/ScheduledPostData";
export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const method = request.method.toUpperCase();
        if (['PUT', 'POST'].includes(method)) {
            const dataService = new DataService(env);
            const topic = "josh412"
            const {
                QSTASH_TOKEN,
                IMAGE_BUCKET,
            } = env;
            // if we have content-type and it is png or jpg
            // upload media
            const allowedMediaTypes = ["image/png","image/jpeg"];
            const contentType = request.headers.get("content-type");

            if( contentType && allowedMediaTypes.includes(contentType)  ){
               const uploadResponse =  await handlePut(request,IMAGE_BUCKET );
               return uploadResponse;
            }
            //if not JSON return invalid
            if( ! contentType || ! contentType.includes("application/json") ){
                return new Response(JSON.stringify({
                    status: "content-typenot allowed",
                }), { status: 400 });
            }
            const body = await request.text();
            const nowInseconds = Math.round( Date.now().valueOf() / 1000 );
            const notBefore = nowInseconds + 3;
            const data = JSON.parse(body) as InsertScheduledPost;
            //Validate accounts exist
            data.accounts.map(async (accountKey:string) => {
                const account = await dataService.accounts.getAccount(accountKey);
                if( ! account ){
                    return new Response(JSON.stringify({
                        status: `Account ${accountKey} not found`,
                    }), { status: 400 });
                }
            });
            const keys = await dataService.scheduledPosts.savePost(data);
            try {
                const response = await fetch(`https://qstash.upstash.io/v1/publish/${topic}`, {
                    method: 'POST',
                    body: JSON.stringify({
                        keys
                    }),
                    headers: {
                        "content-type": "application/json",
                        "Authorization": `Bearer ${QSTASH_TOKEN}`,
                        //"Upstash-Delay": "3s"
                        //https://upstash.com/docs/qstash/features/delay#absolute-delay
                        //. The format is a unix timestamp in seconds, based on the UTC timezone.
                        "Upstash-Not-Before": notBefore.toString(),
                    },
                });
                return new Response(JSON.stringify({
                    status: response.statusText,
                }), { status: response.status });
            } catch (error) {
                console.log({ error });
                return new Response(JSON.stringify(error), { status: 200 });
            }

        }
        // GET should return saved
        return new Response(JSON.stringify({ serive: "scheduler" }), { status: 200 });
    },
};

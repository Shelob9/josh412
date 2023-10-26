import { DataService, Env } from '@feeder';
import { handlePut } from "@media/handlers";
import { z } from "zod";

const schedulePostBody = z.object({
    text: z.string(),
    mediaKeys: z.string().array().optional(),
    accounts: z.string().array(),
    postAt: z.number(),
});
type SchedulePostBody = z.infer<typeof schedulePostBody>;
export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const method = request.method.toUpperCase();
         const dataService = new DataService(env);
         if (['PUT', 'POST'].includes(method)) {
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
            try {
                const data : SchedulePostBody = schedulePostBody.parse(JSON.parse(body));
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
                        keys: keys,
                    }), { status: response.status });
                } catch (error) {
                    console.log({ error });
                    return new Response(JSON.stringify(error), { status: 400 });
                }
            } catch (error) {
                console.log({ error });
                return new Response(JSON.stringify(error), { status: 400 });
            }
        }

        // GET should return saved
        //const posts = await dataService.scheduledPosts.getSavedPosts();
        return new Response(JSON.stringify({ service: "scheduler" }), { status: 200 });
    },
};

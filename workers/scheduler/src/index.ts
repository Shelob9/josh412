import { handlePut } from "@media/handlers";
import { Receiver } from "@upstash/qstash";
import ScheduledPostData, { InsertScheduledPost } from "./data/scheduled";
export interface Env {
    QSTASH_CURRENT_SIGNING_KEY: string;
    QSTASH_NEXT_SIGNING_KEY: string;
    QSTASH_TOKEN: string;
    UPSTASH_QSTASH_URL: string;
    IMAGE_BUCKET: R2Bucket;
    KV: KVNamespace;
}
export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const method = request.method.toUpperCase();
        if (['PUT', 'POST'].includes(method)) {

            const topic = "josh412"

            const {
                QSTASH_CURRENT_SIGNING_KEY,
                QSTASH_NEXT_SIGNING_KEY,
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
            const dataApi =  new ScheduledPostData(env.KV);
            if ('PUT' === method) {
                const nowInseconds = Math.round( Date.now().valueOf() / 1000 );
                const notBefore = nowInseconds + 3;
                const data = JSON.parse(body) as InsertScheduledPost;
                const keys = await dataApi.savePost(data);

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
            } else {
                const receiver = new Receiver({
                    currentSigningKey: QSTASH_CURRENT_SIGNING_KEY,
                    nextSigningKey: QSTASH_NEXT_SIGNING_KEY,
                });

                const isValid = await receiver
                    .verify({
                        signature: request.headers.get("Upstash-Signature")!,
                        body,
                    })
                    .catch((err) => {
                        console.error(err);
                        return false;
                    });
                console.log({ isValid, body })
                if (!isValid) {
                    return new Response("Invalid signature", { status: 401 });
                }
                const keys = JSON.parse(body) as string[];

                const posts = Promise.all(
                    keys.map(key => dataApi.getSavedPost(key))
                );
                const send = async (post: InsertScheduledPost) => {
                    //@todo this
                    return false;
                }
                const responses = Promise.all(
                    (await posts).map(async (post) => {
                        if( ! post ){
                            return false;
                        }
                        const sent = await send(post);
                        if( sent ){
                            return dataApi.markPostAsSent(post);
                        }
                    })
                );
                return new Response(JSON.stringify({
                    responses,
                    body
                }), { status: 200 });
            }

        }

        //Put UI here
        return new Response(JSON.stringify({ hi: "roy" }), { status: 200 });


    },
};

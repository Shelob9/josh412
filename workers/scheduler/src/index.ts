import { Receiver, Client } from "@upstash/qstash";
import {handlePut} from "@media/handlers"
export interface Env {
    QSTASH_CURRENT_SIGNING_KEY: string;
    QSTASH_NEXT_SIGNING_KEY: string;
    QSTASH_TOKEN: string;
    UPSTASH_QSTASH_URL: string;
    IMAGE_BUCKET: R2Bucket;
}
export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const method = request.method.toUpperCase();
        if (['PUT', 'POST'].includes(method)) {

            const topic = "josh412"
            const body = await request.text();
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

            if ('PUT' === method) {
                const nowInseconds = Math.round( Date.now().valueOf() / 1000 );
                const notBefore = nowInseconds + 3;
                try {
                    const response = await fetch(`https://qstash.upstash.io/v1/publish/${topic}`, {
                        method: 'POST',
                        body,
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
                return new Response(body, { status: 200 });
            }

        }

        //Put UI here
        return new Response(JSON.stringify({ hi: "roy" }), { status: 200 });


    },
};

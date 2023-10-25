import { DataService, Env, ScheduledPostData } from "@feeder";
import { Receiver } from "@upstash/qstash";
import { Account, ScheduledPost } from "../../../packages/feeder/src/data/ScheduledPostData";
export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const method = request.method.toUpperCase();
        if (['PUT', 'POST'].includes(method)) {


            const contentType = request.headers.get("content-type");
			const dataService = new DataService(env);
            const {
                QSTASH_CURRENT_SIGNING_KEY,
                QSTASH_NEXT_SIGNING_KEY,
                QSTASH_TOKEN,
                IMAGE_BUCKET,
            } = env;

            //if not JSON return invalid
            if( ! contentType || ! contentType.includes("application/json") ){
                return new Response(JSON.stringify({
                    status: "content-typenot allowed",
                }), { status: 400 });
            }
            const body = await request.text();
            const dataApi =  new ScheduledPostData(dataService);

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

                const posts = await Promise.all(
                    keys.map(key => dataApi.getSavedPost(key))
                );
                const send = async (post: ScheduledPost) => {

                }
                const responses = Promise.all(
                    ( posts).map(async (post:ScheduledPost|null) => {
						if( ! post ){
							return;
						}
                        post.accounts.map(async (account:Account) => {
							switch(account.network){
								case "bluesky":
									break;
								case "mastodon":
									break;
							}
							const response = await send(post);
							console.log({response});
						})
                    }).filter(p => p)
                );
                return new Response(JSON.stringify({
                    responses,
                    body
                }), { status: 200 });


        }

        //Put UI here
        return new Response(JSON.stringify({ hi: "roy" }), { status: 200 });


    },
};

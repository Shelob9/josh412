import { DataService, Env, ScheduledPostData } from "@feeder";
import { createMastodonStatus } from "@social";
import { Receiver } from "@upstash/qstash";
import { ScheduledPost } from "../../../packages/feeder/src/data/ScheduledPostData";
/**
 * Handler for posting scheduled posts
 *
 * Is the callback for qStash topic that scheduler uses
 */
export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const method = request.method.toUpperCase();
        if (['PUT', 'POST'].includes(method)) {
            const contentType = request.headers.get("content-type");
			const dataService = new DataService(env);
            const {
                QSTASH_CURRENT_SIGNING_KEY,
                QSTASH_NEXT_SIGNING_KEY,
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
				return new Response(JSON.stringify({
					message: "Unauthorized."
				}), { status: 401 });
			}
			const keys = JSON.parse(body) as string[];

			const posts = await Promise.all(
				keys.map(key => dataApi.getSavedPost(key))
			).catch(getSavedPostError => {
				console.log({getSavedPostError});
			});
			if( ! posts || posts.length === 0 ){
				return new Response(JSON.stringify({
					message: "No posts found",
				}), { status: 400 });
			}
			const responses = Promise.all(
				( posts).map(async (post:ScheduledPost|null) => {
					if( ! post ){
						return;
					}
					post.accounts.map(async (accountKey:string) => {
						const account = await dataService.accounts.getAccount(accountKey);
						if( ! account ){
							return;
						}
						switch(account.network){
							case "bluesky":

								break;
							case "mastodon":
								const mastodonToken = await dataService.accounts.getAccountToken(accountKey);
								if( mastodonToken ){
										const r = await createMastodonStatus(mastodonToken,post.post.text,account.instanceUrl, 'public');
										dataService.scheduledPosts.markPostAsSentByKey(post.key);
										return {
											id: r.id,
											accountKey,
											success: true,
										}
								}else{
									return {
										id: undefined,
										accountKey,
										success: false,
									}
								}
								break;
						}
					})
				}).filter(p => p)
			);
			return new Response(JSON.stringify({
				responses,
				body
			}), { status: 200 });
        }

        //Put UI here?
        return new Response(JSON.stringify({ service:"poster", hi: "roy" }), { status: 200 });

    },
};

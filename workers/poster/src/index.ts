import { DataService, Env, ScheduledPostData } from "@feeder";
import { createMastodonStatus, postBsykyStatus, tryBskyLogin } from "@social";
import { Receiver } from "@upstash/qstash";
import zod from "zod";
import { ScheduledPost } from "../../../packages/feeder/src/data/ScheduledPostData";

const sendPostBody = zod.object({
	postKeys: zod.string().array(),
});
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
			//validate with zod
			try {
				//validate with zod
				const data = sendPostBody.parse(JSON.parse(body));
			} catch (error) {
				return new Response(JSON.stringify({
					status: "Invalid request body",
					error,
				}), { status: 400 });
			}
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
			const postKeys = JSON.parse(body) as string[];

			const posts = await Promise.all(
				postKeys.map(key => dataApi.getSavedPost(key))
			).catch(getSavedPostError => {
				console.log({getSavedPostError});
			});
			if( ! posts || posts.length === 0 ){
				return new Response(JSON.stringify({
					message: "No posts found",
				}), { status: 400 });
			}
			type SuccesResponse = {
				id: string;
				uri: string;
				postKey: string;
				accountKey: string;
				success: true;

			};
			type FailResponse = {
				postKey: string;
				accountKey: string;
				success: false;
				errors?: string[];
			}
			const responses : (SuccesResponse | FailResponse )[] = []

			posts.forEach(async (post:ScheduledPost|null) => {
				if( ! post ){
					return undefined;
				}
				return post.accounts.map(async (accountKey:string) => {
					const account = await dataService.accounts.getAccount(accountKey);
					if( ! account ){
						return undefined;
					}
					switch(account.network){
						case "bluesky":
							const loginDetails = await dataService.accounts.getAccountToken(accountKey);
							if( loginDetails ){
								try {
									// split login details on : to get identifier and password
									const [identifier, password] = loginDetails.split(":");
									const {agent} = await tryBskyLogin({
										service: "bluesky.social",
										identifier,
										password,
									});
									const r = await postBsykyStatus({
										agent,
										text: post.text,
									});
									responses.push( {
										id: r.cid,
										uri: r.uri,
										accountKey,
										postKey: post.key,
										success: true,
									})
								} catch (error:any) {
									responses.push({
										accountKey,
										postKey: post.key,
										success: false,
										errors: [error.message],
									});
								}


							}else{
								responses.push({
									accountKey,
									postKey: post.key,
									success: false,
									errors: ["Could not login"],
								});
							}
							break;
						case "mastodon":
							const mastodonToken = await dataService.accounts.getAccountToken(accountKey);
							if( mastodonToken ){
									const r = await createMastodonStatus(mastodonToken,post.text,account.instanceUrl, 'public');
									dataService.scheduledPosts.markPostAsSentByKey(post.key);
									responses.push({
										id: r.id,
										uri: r.uri,
										postKey: post.key,
										accountKey,
										success: true,
									});
							}else{
								responses.push({
									accountKey,
									postKey: post.key,
									success: false,
									errors: ["Could not get mastodon token"],
								});
							}
							break;
					}
				})
			});

			return new Response(JSON.stringify({
				responses,
				postKeys,
			}), { status: 201 });
		}


        //Put UI here?
        return new Response(JSON.stringify({ service:"poster", hi: "roy" }), { status: 200 });

    },
};

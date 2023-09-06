/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	KV: KVNamespace;
	josh412bskypass: string;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}
import  { AtpSessionData, AtpSessionEvent, BskyAgent } from '@atproto/api';
import { jsonResponse } from './utils';



export async function login({ service, identifier, password,kv }: {
  service?: string,
  identifier: string,
  password: string,
  kv: KVNamespace,
}) {

	const saveKey = `atp-savedsession:${service}:${identifier}`;
	const agent = new BskyAgent({
		service: service ?? 'https://bsky.social',
		persistSession: (evt: AtpSessionEvent, sess?: AtpSessionData) => {
			if( sess && ! ['created','updated'].includes(evt) ) {
				kv.put(saveKey, JSON.stringify(sess));
			}else{
				kv.delete(saveKey);
			}
		}
	});
	const tryLogin = async () => {
		await agent.login({
			identifier,
			password,
		});
	};
	let saved = await kv.get(saveKey);
	let resumed = false;

	if( saved ) {
		try {
			await agent.resumeSession(JSON.parse(saved));
			resumed = true;
		} catch (error) {
			kv.delete(saveKey);
			await tryLogin();
		}

	}else{
		await tryLogin();
	}
	return {agent,resumed};
}

type T_error = {
	message: string,
	headers?: Record<string,string>,
}
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if( !env.josh412bskypass ) {
			return jsonResponse({
				error: 'no josh412bskypass',
			},{
				status: '500',
			});
		}
		try {

			const {agent} = await login({
				identifier: 'josh412.com',
				password: env.josh412bskypass,
				kv: env.KV,
			});


			const results = await agent.getActorLikes({
				actor: 'josh412.com',
			});
			return jsonResponse(results);


		} catch (error: any) {
			console.log(error);
			return jsonResponse(
			{
				t: typeof error,
				message: error.message,
			},{
				...error.headers,
				status: error.status ?? 500
			});
		}
	},
};

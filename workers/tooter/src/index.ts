
export interface Env {
	KV: KVNamespace;
}
import  { AtpSessionData, AtpSessionEvent, BskyAgent, RichText } from '@atproto/api';
import { jsonResponse } from './utils';

export async function login({ service, identifier, password,kv }: {
  service?: string,
  identifier: string,
  password: string,
  kv: KVNamespace,
}) {

	const saveKey = `at-savedsession_2:${service}:${identifier}`;
	const agent = new BskyAgent({
		service: service ?? 'https://bsky.social',
		persistSession: (evt: AtpSessionEvent, sess?: AtpSessionData) => {
			if( sess && ! ['created','updated'].includes(evt) ) {
				kv.put(saveKey, JSON.stringify(sess), {
					//expire in 1 hour
					expirationTtl: 60 * 60,
				});
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

const ALLOWED_USERS = [
	'josh412.com',
	'josh412.dev'
];
/**
     * Parse HTTP Basic Authorization value.
     * @param {Request} request
     * @throws {BadRequestException}
     * @returns {{ user: string, pass: string }}
     */
async function basicAuthentication(request:Request) {
	const Authorization = request.headers.get("Authorization") || '';

	const [scheme, encoded] = Authorization.split(" ");

	// The Authorization header must start with Basic, followed by a space.
	if (!encoded || scheme !== "Basic") {
		return  {
			status: 400,
			message: 'Malformed authorization header.',
			statusText: 'Unauthorized',
			user: null,
			pass: null,
		}
	}


	// Decodes the base64 value and performs unicode normalization.
	// @see https://datatracker.ietf.org/doc/html/rfc7613#section-3.3.2 (and #section-4.2.2)
	// @see https://dev.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
	const buffer = Uint8Array.from(atob(encoded), (character) =>
	  character.charCodeAt(0)
	);
	const decoded = new TextDecoder().decode(buffer).normalize();

	// The username & password are split by the first colon.
	//=> example: "username:password"
	const index = decoded.indexOf(":");

	let user : string|null = null;
	let pass : string|null = null;
	// The user & password are split by the first colon and MUST NOT contain control characters.
	// @see https://tools.ietf.org/html/rfc5234#appendix-B.1 (=> "CTL = %x00-1F / %x7F")
	if (index === -1 || /[\0-\x1F\x7F]/.test(decoded)) {
		return {
			status: 401,
			message: 'Unauthorized',
			statusText: 'Unauthorized',
			user,
			pass,
		}
	}
	user = decoded.substring(0, index) ? decoded.substring(0, index).toLowerCase() : '';
	pass = decoded.substring(index + 1);

	if( ! ALLOWED_USERS.includes(user) ) {
		return {
			status: 400,
			message: 'Not Josh',
			statusText: 'Unauthorized',
			user: null,
			pass: null,
		}
	}
	return {
	  user,
	  pass,
	  status: 200,
	  message: 'Has auth'
	};
  }

  async function basicAuthToBskyAgent(request:Request,env:Env) {
	const {user,pass,status,message} = await basicAuthentication(request);
	if( ! user || ! pass ) {
		return {
			status,
			message,
			agent: null,
			resumed: false,
		};
	}
	try {

		const {agent,resumed} = await login({
			identifier: user,
			password: pass,
			kv: env.KV,

		});
		return {
			status,
			message,
			agent,
			resumed,
		};
	} catch (error:any) {
		return {
			status: error.status ?? 400,
			agent: null,
			resumed: false,
			message: error.message ? error.message : error.toString(),
		}
	}
  }


export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const {
			status,
			message,
			agent,
			resumed,
		} = await basicAuthToBskyAgent(request,env);
		if( ! agent ) {
			const rStatus = status >= 400 ? status : 401;
			return jsonResponse({
				message,
			},{
				status: rStatus.toString(),
			});
		}


		try {
			const {method} = request;
			if( 'POST' === method ) {
				const data = await request.json() as {
					text: string,
				};
				if( ! data.text ) {
					return jsonResponse({
						error: 'no text',
					},{
						status: '400',
					});
				}
				const {text} = data;
				const rt = new RichText({ text })
				await rt.detectFacets(agent)
				const postRecord = {
					$type: 'app.bsky.feed.post',
					text: rt.text,
					facets: rt.facets,
					createdAt: new Date().toISOString(),
					lang: 'en'
				};
				const results = await agent.post(postRecord);
				return jsonResponse({
					uri: results.uri,
					cid: results.cid,
					resumed,
					facets: rt.facets,
				});

			}else{
				const likes = await agent.getActorLikes({
					actor: 'josh412.com',
				});
				return jsonResponse({
					resumed,
					likesCursor: likes.data.cursor,
					likes: likes.data.feed,
				});
			}


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

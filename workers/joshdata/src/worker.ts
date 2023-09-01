import { DrizzleD1Database, drizzle } from 'drizzle-orm/d1';
import { classifications } from './db/schema';
import { Status, getAccount, getStatuses } from './social/mastodon';

export interface Env {
	KV: KVNamespace;
	DB1: D1Database,
	DATABUCKET: R2Bucket;
	AUTH_SECRET: string;
}

export type CONTENT_TYPE = 'photo' | 'media' | 'socialpost';
export type TAXONOMY = {
	id: number;
	slug: string;
	label: string;
	private?: boolean;
}
export type TAXONOMIES = TAXONOMY[];
export type TAXONONOMY_MAP =  {
	[key: string]: TAXONOMY;
}
export type TERM = {
	id: number;
	slug: string;
	label: string;
	taxonomy: number;
}
export type TERMS = TERM[];
export type TERM_MAP =  {
	[key: string]: TERM;
}
const taxonomyMap : TAXONONOMY_MAP = {
	urlslug :{
		id: 1,
		slug: 'urlslug',
		label: 'URL Slug',
		private:true
	},

	photo: {
		id: 2,
		slug: 'photo',
		label: 'Photo Type',
	}

}

const termMap : TERM_MAP = {
	gm: {
		id: 1,
		slug: 'gm',
		label: 'Good Morning Photos',
		taxonomy: 2,
	},
	dog: {
		id: 2,
		slug: 'dog',
		label: 'Dog Photos',
		taxonomy: 2,
	},
	flower: {
		id: 3,
		slug: 'flower',
		label: 'Flower Photos',
		taxonomy: 2,
	},
	tree: {
		id: 4,
		slug: 'tree',
		label: 'Tree Photos',
		taxonomy: 2,
	},
	leaf: {
		id: 5,
		slug: 'leaf',
		label: 'Leaf Photos',
		taxonomy: 2,
	},
}


async function dataapi({
	db,
	kv,
}:{
	db: D1Database,
	kv: KVNamespace,
}){

	const getNextUid = async (contentType: string ) => {
		let saved = await kv.get( `${contentType}:lastuid}`);
		let u = saved ?parseInt(saved.replace(/^0+/,''),10) : 0;
		u++;
		await kv.put(`${contentType}:lastuid`,u.toString());
		return u.toString();
	}

	const makeKeyPrefix = ({contentType,txid}:{contentType: string, txid: number}) => {
		return `${contentType}:${txid}`;
	}
	const makeKey = ({contentType,txid,uid}:{contentType: string, txid: number, uid: string}) => {
		return `${makeKeyPrefix({contentType,txid})}:${uid}`;
	}

	const createNewKey = async  (contentType: string, primaryterm: string,) => {
		if( ! termMap[primaryterm] ){
			throw new Error(`Invalid term ${primaryterm}`);
		}
		const txid = termMap[primaryterm].id;
		const uid = await getNextUid(contentType);

		return makeKey({
			contentType,
			txid,
			uid,
		});
	}

	async function getItemByKey(key:string){
		const data = await kv.get(key) as any;
		if( ! data ){
			return null;
		}
		return JSON.parse(data);
	}

	async function getItem( key:string){
		return getItemByKey(key);
	}
	async function putItemByKey(key:string,data:any){
		await kv.put(key,JSON.stringify(data));
		return key;
	}
	async function getItemsByKey(key:string,cursor?:string){
		let  data = await kv.list({prefix:key,cursor}) as any;
		if( ! data ){
			return null;
		}
		data = JSON.parse(data);
		return data;
	}

	async function deleteItemByKey(key:string){
		await kv.delete(key);
	}


	return {
		putItemByKey,
		getItemByKey,
		getItemsByKey,
		putItem: async (contentType: string, primaryterm: string, data: any) => {
			const key = await createNewKey(contentType,primaryterm);
			await putItemByKey(key,data);
			return key;
		},
		getItem,
		getItems: async (contentType: string, primaryterm: string, cursor?:string) => {
			const prefix = makeKeyPrefix({
				contentType,
				txid: termMap[primaryterm].id,
			});
			const items = await getItemsByKey(prefix,cursor);
			return items;
		},
		deleteItemByKey,
		deleteItem: async (key:string) => {
			await deleteItemByKey(key)
		}
	}
}
const jsonReponse = (data: any,status:number) => {
	return new Response(JSON.stringify(data, null, 2), {
		headers: {
			"content-type": "application/json;charset=UTF-8",
		},
		status: status,
	});
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const {DB1,KV,AUTH_SECRET} = env;
		const url = new URL(request.url);

		const hasAuth = request.headers.has('Authorization') || url.searchParams.has('auth');

			if (!hasAuth ) {
				return new Response(JSON.stringify({
					message: 'unauthorized',
					hasAuth,
				}), {
					status: 401,
					headers: {
						"content-type": "text/json;charset=UTF-8",
					}
				});

			}
			let hAUth = request.headers.get('Authorization');
			let uAuth = url.searchParams.get('auth');
			if( hAUth !== `Bearer ${AUTH_SECRET}` && uAuth !== AUTH_SECRET ){
				return new Response(JSON.stringify({
					message: 'unauthorized',
					hasAuth,

				}), {
					status: 401,
					headers: {
						"content-type": "text/json;charset=UTF-8",
					}
				});
			}


		async function processStatus (toot: {
			id: number;
			created_at: string;
			content: string;
		}){
			const key = `socialpost:mastodon:status:${toot.id}`;
			await KV.put(key,JSON.stringify(toot));
		}
		try {
			if( '/api/mastodon' == url.pathname ){
				const cursor = url.searchParams.get('cursor');
				const keys = await KV.list({
					prefix: 'socialpost:mastodon:status',
					limit:1,
					cursor,
				});
				const statuses = await Promise.all(
					keys.keys.map(
						async (key:{name:string}) => {
							const data = await KV.get(key.name);
							//@ts-ignore
							return JSON.parse(data);
						}
					));
				return jsonReponse({
					statuses,
					complete: keys.list_complete	,
					cursor: keys.cursor ? keys.cursor : null,
					cacheStatus: keys.cacheStatus,
					next: keys.cursor ? `${url.origin}${url.pathname}?cursor=${keys.cursor}` : null,
				},200);
			}
			if( '/api/mastodon/injest' == url.pathname ){
				const instanceUrl = 'https://mastodon.social/';
				const lastId = await KV.get('socialpost:mastodon:laststatusid');
				if( lastId === 'done' ){
					return jsonReponse({
						lastId,
						done: true,
					},200);
				}
				const username = 'josh412';
				const account = await getAccount(instanceUrl,username);
				const statuses = await getStatuses(instanceUrl,account.id,lastId ? parseInt(lastId,10) : undefined);
				const newLastId = statuses[statuses.length - 1].id.toString();
				statuses.map(
					async (status:Status) => {
						await processStatus(status);
					}
				)
				if( newLastId ){
					await KV.put('socialpost:mastodon:laststatusid',newLastId);

				}else{
					//mark done
					await KV.put('socialpost:mastodon:laststatusid','done');
				}
				//store last status id
				return jsonReponse({
					lastId,
					newLastId,
					statusCount: statuses.length,
					//statuses,

				},200);
			}
			if( url.pathname.startsWith('/photos') ){
				const urlkey =  url.pathname.replace(/^\/photos\//,'');
				//if has one more parts is index
				if( urlkey.split('/').length === 1 ){
					const result = await data.getItems('photo','gm');
					return jsonReponse(result,200);
				}else{
					const result = await data.getItemByKey(urlkey);
					return jsonReponse(result,200);
				}
				//if has two more parts it is an entry
				//const result = await data.getItems('photo','gm');
				return jsonReponse({
					urlkey
				},200);
			}
			if( url.pathname === '/api/put' ){
				const result = await KV.put( 'to/pu/33', JSON.stringify({
					foo: 'bar',
				}));



				return jsonReponse(result,200);
			}else if( '/api/all' == url.pathname ){
				try {
					await KV.put( 'to/pu/33', JSON.stringify({
						foo: 'bar',
					}));
					await KV.put( 'to/pu/13', JSON.stringify({
						foo: 'eee',
					}));
					await KV.put( 'to/pr/33', JSON.stringify({
						foor: 'bars',
					}));
					const result = await KV.list({
						prefix: 'to/pu'
					});
					return jsonReponse(result,200);
				} catch (error : unknown) {
					return jsonReponse(error,500);

				}
			}
			else if( url.pathname.startsWith('/api/get') ){
				const key = url.pathname.replace(/^\//,'').replace(/^api\/get\//,'');
				try {
					const result = await data.getItemByKey(key);
					return jsonReponse(result,200);

				} catch (error : unknown) {
					return jsonReponse(error,500);

				}


			}else{
				return new Response(JSON.stringify({url,y:url.pathname.startsWith('/photos')}), {
					headers: {
						"content-type": "application/json;charset=UTF-8",
					},
				});
			}

		} catch (error) {
			return new Response(JSON.stringify({error}), {
				headers: {
					"content-type": "application/json;charset=UTF-8",
				},
			});
		}



	},
};

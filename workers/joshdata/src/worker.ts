import { DrizzleD1Database, drizzle } from 'drizzle-orm/d1';
import { INSERT_CLASSIFICATION, classifications } from './db/schema';
import {  getAccount, getStatus, getStatuses } from './social/mastodon';
import { Status } from './social/types/mastodon'
import { getToots, injestToots } from './handlers/mastodon';
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
		const {KV} = env;
		const url = new URL(request.url);
		try {
			if( '/api/mastodon' == url.pathname ){
				const result = await getToots({
					kv: KV,
					cursor: url.searchParams.get('cursor') ?? undefined,
				});
				return result;
			}
			if( '/api/mastodon/injest' == url.pathname ){
				const username = 'josh412';
				const instanceUrl = 'https://mastodon.social/';

				const results = await injestToots({
					kv: KV,
					instanceUrl,
					username,
					stage: 'save',
				});
				return results;
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
					const result = await data.getItemByKey(key);
					return jsonReponse(result,200);




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

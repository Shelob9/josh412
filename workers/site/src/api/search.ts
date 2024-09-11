
import { Status } from "@app/types/mastodon";
import config from "@lib/config";
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { Bindings, Variables } from "../../app.types";
import {
	blueskyDidToCongig,
	BskyPostSimple,
	getBlueskyStatus,
	getBlueskyTimeline, getBluskyAccount, getBskyLikes,
	isValidAccontId,
	mastodonAccountIdToConfig,
	MastodonApi, searchBlueskyStatuses, tryBskyLogin
} from '../social';
import BlueskyStatusToSimple, { fetchBlueskyStatusesSimple } from "./util/BlueskyStatusToSimple";

const api = new Hono<{Variables: Variables,Bindings:Bindings}>();

const {  uri } = config;
const searchUrlApi = `${uri}/api/search`;


api.use('*', logger());

api.get('/mastodon/:accountId', async (c) => {
	const accountId = c.req.param("accountId");

	if(! accountId) {
		return c.json({error: 'accountId is required'}, 400);
	}
	if( ! isValidAccontId(accountId,'mastodon') ){
		return c.json({error: 'account not found'}, 404);
	}
	const {instanceUrl,slug} = mastodonAccountIdToConfig(accountId);


	const api = new MastodonApi(instanceUrl);
	const account = await api.getAccountById(accountId,instanceUrl);
	if( !  account ){
		return c.json({error: 'account not found'}, 404);
	}
	if (c.req.query("q")) {
		const tokens = JSON.parse(c.env.MASTODON_TOKENS);

		const token = tokens[slug] ?? undefined;
		if( ! token ){
			return c.json({error: `Token required for search of ${slug}`}, 501);
		}
		const instanceUrl = c.req.query("instanceUrl") || undefined;
		const following = c.req.query("following") || false;
		let queryAccountId = c.req.query("accountId") || undefined;
		const q = c.req.query("q") as string || '';
		if( queryAccountId === 'mine' ){
			queryAccountId = account.id;
		}
		let maxId = c.req.query("maxId") || undefined;

		if( ! maxId ){
			const cursor = c.req.query("cursor") || undefined;
			//if is maxId=<cursor> get cursor
			//UI pages by  maxId=<cursor>
			console.log({cursor});
			if( cursor ){
				const parts = cursor.split('=');
				if( parts.length === 2 ){
					maxId = parts[1];
				}
			}
		}

		const statuses = await api.search(q as string,{
			instanceUrl,
			following: following ? true : undefined,
			account_id: queryAccountId,
			token,
			maxId,
		}) as Status[];
		const lastId = statuses[statuses.length - 1].id;

		return c.json({
			maxId,
			cursor: maxId ? `maxId=${maxId}` :undefined,
			nextCursor:lastId ? `maxId=${lastId}` : undefined,
			next: `${searchUrlApi}/mastodon/${accountId}/?q=${q}&maxId=${lastId}`,
			statuses,
			accountId,
		});

	}

	return c.json({accountId,account,});
});


api.get('/mastodon/:accountId/statuses', async (c) => {
	const accountId = c.req.param("accountId");
	if(! accountId) {
		return c.json({error: 'accountId is required'}, 400);
	}


	let maxId = c.req.query("maxId") || undefined;

	if( ! maxId ){
		const cursor = c.req.query("cursor") || undefined;
		//if is maxId=<cursor> get cursor
		//UI pages by  maxId=<cursor>
		console.log({cursor});
		if( cursor ){
			const parts = cursor.split('=');
			if( parts.length === 2 ){
				maxId = parts[1];
			}
		}
	}
	const cr = mastodonAccountIdToConfig(accountId);
	const {instanceUrl} = cr;

	const api = new MastodonApi(instanceUrl);
	try {
		const statuses = await api.getStatuses({accountId,maxId});

		const lastId = statuses.length ? statuses[statuses.length - 1].id : undefined;
		return c.json({
			maxId,
			cursor: maxId ? `maxId=${maxId}` :undefined,
			nextCursor:lastId ? `maxId=${lastId}` : undefined,
			next: `${searchUrlApi}/mastodon/${accountId}/statuses?maxId=${lastId}`,
			statuses,
			accountId,
		});
	} catch (error) {
		console.log({1:error});
		return c.json({error: 'Could not get statuses'}, 400);

	}
})


api.get('/mastodon/:accountId/likes', async (c) => {
	const accountId = c.req.param("accountId");
	if(! accountId) {
		return c.json({error: 'accountId is required'}, 400);
	}


	let maxId = c.req.query("maxId") || undefined;

	if( ! maxId ){
		const cursor = c.req.query("cursor") || undefined;
		//if is maxId=<cursor> get cursor
		//UI pages by  maxId=<cursor>
		console.log({cursor});
		if( cursor ){
			const parts = cursor.split('=');
			if( parts.length === 2 ){
				maxId = parts[1];
			}
		}
	}
	const cr = mastodonAccountIdToConfig(accountId);
	const {instanceUrl,slug} = cr;
	const tokens = JSON.parse(c.env.MASTODON_TOKENS);

	const token = tokens[slug] ?? undefined;
	if( ! token ){
		return c.json({error: `Token required for search of ${slug}`}, 501);
	}
	const api = new MastodonApi(instanceUrl,token);
	try {
		const statuses = await api.getLikes({maxId});

		const lastId = statuses.length ? statuses[statuses.length - 1].id : undefined;
		return c.json({
			maxId,
			cursor: maxId ? `maxId=${maxId}` :undefined,
			nextCursor:lastId ? `maxId=${lastId}` : undefined,
			next: `${searchUrlApi}/mastodon/${accountId}/statuses?maxId=${lastId}`,
			statuses,
			accountId,
		});
	} catch (error) {
		console.log({1:error});
		return c.json({error: 'Could not get statuses'}, 400);

	}
})

api.get('/mastodon/:accountId/timeline', async (c) => {
	const accountId = c.req.param("accountId");
	if(! accountId) {
		return c.json({error: 'accountId is required'}, 400);
	}


	let maxId = c.req.query("maxId") || undefined;

	if( ! maxId ){
		const cursor = c.req.query("cursor") || undefined;
		//if is maxId=<cursor> get cursor
		//UI pages by  maxId=<cursor>
		console.log({cursor});
		if( cursor ){
			const parts = cursor.split('=');
			if( parts.length === 2 ){
				maxId = parts[1];
			}
		}
	}
	const cr = mastodonAccountIdToConfig(accountId);
	const {instanceUrl,slug} = cr;
	const tokens = JSON.parse(c.env.MASTODON_TOKENS);

	const token = tokens[slug] ?? undefined;
	if( ! token ){
		return c.json({error: `Token required for search of ${slug}`}, 501);
	}

	const api = new MastodonApi(instanceUrl, token);
	try {
		const statuses = await api.getTimeLine({maxId});

		const lastId = statuses.length ? statuses[statuses.length - 1].id : undefined;
		return c.json({
			maxId,
			cursor: maxId ? `maxId=${maxId}` :undefined,
			nextCursor:lastId ? `maxId=${lastId}` : undefined,
			next: `${searchUrlApi}/mastodon/${accountId}/statuses?maxId=${lastId}`,
			statuses,
			accountId,
		});
	} catch (error) {
		console.log({1:error});
		return c.json({error: 'Could not get statuses'}, 400);

	}
});

api.get('/bluesky/:did', async (c) => {
	const did = c.req.param("did");
	if(! did) {
		return c.json({error: 'did is required'}, 400);
	}
	if( ! isValidAccontId(did,'bluesky') ){
		return c.json({error: 'account not found'}, 404);
	}
	const account = blueskyDidToCongig(did);
	if( ! account ){
		return c.json({error: 'account not found'}, 404);
	}
    if( ! c.env.JOSH412_BSKY ){
        return c.json({error: 'No BSKY password',}, 501);
    }


	try {
		const agent = await tryBskyLogin({
			identifier: account?.name,
			password: c.env.JOSH412_BSKY,

		});
		if( c.req.query("q") ){
			const cursor = c.req.query("cursor") || undefined;
			const q = c.req.query("q") as string || '';
			let queryAccountId = c.req.query("accountId") || undefined;
			if( 'mine' === queryAccountId ){
				queryAccountId = account.did;
			}
			const statuses = await searchBlueskyStatuses({
				agent: agent.agent,
				actor: queryAccountId,
				args:{q},
			});

			const simpled :BskyPostSimple[] = await Promise.all(statuses.statuses.map(async (s) => {
					const post = await getBlueskyStatus({
						agent: agent.agent,
						uri: s.uri,
					});
					if (post.thread) {
						return BlueskyStatusToSimple(post.thread) as BskyPostSimple;
					}
					return undefined;
				}).filter(s => s !== undefined) as unknown as BskyPostSimple[]);
			return c.json({
				did,
				cursor: cursor ? `cursor=${cursor}`:undefined,
				next: `${searchUrlApi}/bluesky/${did}/statuses?cursor=${statuses.statusesCursor}`,
				nextCursor:statuses.statusesCursor ? `cursor=${statuses.statusesCursor}`:undefined,
				statuses:	simpled

			});
		}
		const details = await getBluskyAccount({
			agent: agent.agent,
			username: account.name,
		});
		return c.json({did,account,details});
	} catch (error) {

	}
});


api.get('/bluesky/:did/statuses', async (c) => {
	const did = c.req.param("did");
	if(! did) {
		return c.json({error: 'did is required'}, 400);
	}
	if( ! isValidAccontId(did,'bluesky') ){
		return c.json({error: 'account not found'}, 404);
	}
	const account = blueskyDidToCongig(did);
	if( ! account ){
		return c.json({error: 'account not found'}, 404);
	}
	const cursor = c.req.query("cursor") || undefined;

	try {
		const agent = await tryBskyLogin({
			identifier: account?.name,
			password: c.env.JOSH412_BSKY,
		});
		try {
			const returnValue = await fetchBlueskyStatusesSimple({
				agent: agent.agent,
				actor: account.did,
				cursor,
			})

			return c.json(returnValue);
		} catch (error) {
			//console.log({error});
			return c.json({error: 'Error1'}, 501);

		}
	} catch (error) {
		console.log(error);
		return c.json({error: 'Error'}, 500);
	}
});

//Likes
api.get('/bluesky/:did/likes', async (c) => {
	const did = c.req.param("did");
	if(! did) {
		return c.json({error: 'did is required'}, 400);
	}
	if( ! isValidAccontId(did,'bluesky') ){
		return c.json({error: 'DID not valid'}, 404);
	}
	const account = blueskyDidToCongig(did);
	if( ! account ){
		return c.json({error: 'DID valid, but account not found'}, 404);
	}
	const cursor = c.req.query("cursor") || undefined;
	try {
		const agent = await tryBskyLogin({
			identifier: account?.name,
			password: c.env.JOSH412_BSKY,
		});
		const statuses = await getBskyLikes({
			agent: agent.agent,
			actor: account.did,
			cursor,
		});
		const returnStatuses = statuses.likes.map(BlueskyStatusToSimple).filter( s => s !== undefined) as BskyPostSimple[];
			return c.json({
				did,
				cursor: cursor ? `cursor=${cursor}`:undefined,
				next: `${searchUrlApi}/bluesky/${did}/likes?cursor=${statuses.likesCursor}`,
				nextCursor:statuses.likesCursor ? `cursor=${statuses.likesCursor}`:undefined,
				statuses: returnStatuses

			});
	} catch (error) {
		console.log({error,account});
		return c.json({error: 'Account not found (catch)'}, 404);
	}
});



//Timeline
api.get('/bluesky/:did/timeline', async (c) => {
	//Add auth on this first?
	return c.json({error: 'Not implemented'}, 501);
	const did = c.req.param("did");
	if(! did) {
		return c.json({error: 'did is required'}, 400);
	}
	if( ! isValidAccontId(did,'bluesky') ){
		return c.json({error: 'account not found'}, 404);
	}
	const account = blueskyDidToCongig(did);
	if( ! account ){
		return c.json({error: 'account not found'}, 404);
	}
	const cursor = c.req.query("cursor") || undefined;
	try {
		const agent = await tryBskyLogin({
			identifier: account?.name,
			password: c.env.JOSH412_BSKY,
		});
		const statuses = await getBlueskyTimeline({
			agent: agent.agent,
			cursor,
		});
		return c.json({
			nextCursor:statuses.cursor,
			statuses:statuses.posts
		});
	} catch (error) {
		return c.json({error: 'account not found'}, 404);
	}
});

api.get('/search', async (c) => {
	const routes = [];
	for(const m of config.social.mastodon){
		routes.push({
			name: `${m.name} ${m.instanceUrl} account details`,
			url: `${searchUrlApi}/mastodon/${m.accountId}`
		});
		routes.push({
			name: `${m.name} ${m.instanceUrl} statuses`,
			url: `${searchUrlApi}/mastodon/${m.accountId}/statuses`
		});
	}
	for(const b of config.social.bluesky){
		routes.push({
			name: `${b.name} ${b.did} account details`,
			url: `${searchUrlApi}/bluesky/${b.did}`
		});
		routes.push({
			name: `${b.name} ${b.did} statuses`,
			url: `${searchUrlApi}/bluesky/${b.did}/statuses`
		});
		routes.push({
			name: `${b.name} ${b.did} likes`,
			url: `${searchUrlApi}/bluesky/${b.did}/likes`
		});
	}
	return c.json({routes});
});

api.notFound(async (c) => {
	return c.json({error: 'Not found',api:"search"}, 404);
});

export default api;

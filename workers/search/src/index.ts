
import config from "@lib/config";
import { getBlueskyStatuses, getBlueskyTimeline, getBluskyAccount, getBskyLikes, MastodonApi, tryBskyLogin } from '@social';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
const { cacheSeconds, uri } = config;
const searchUrlApi = `${uri}/search`;

type SOCIAL_NETWORK = 'mastodon' | 'bluesky';
export interface Env {
	JOSH412_BSKY: string;
	KV: KVNamespace;
}
function isValidAccontId(accountId: string,network:SOCIAL_NETWORK): boolean {
	if( accountId.length > 0 && ['mastodon','bluesky'].includes(network) ){
		switch (network) {
			case 'mastodon':
				return undefined != mastodonAccountIdToConfig(accountId);
			case 'bluesky':
				return undefined != blueskyDidToCongig(accountId);
			default:
				return false;
		}
	}
	return false;
}
function mastodonAccountIdToConfig(accountId: string):{
	name: string,
	instanceUrl: string,
	accountId: string
}|undefined {
	return config.social.mastodon.find( a => a.accountId === accountId);

}

function blueskyDidToCongig(did:string): {name:string,did:string} | undefined {
	return config.social.bluesky.find( a => a.did === did);
}
const workerName = 'search';

const instanceUrl = 'https://mastodon.social';
const accountId = 425078;
//`/mastodon/425078/statuses`

type Bindings = {
	JOSH412_BSKY: string
}
type Variables = {
	KV: KVNamespace
}
const app = new Hono<{ Bindings: Bindings; Variables: Variables }>({ strict: false });

app.use('*', logger());
app.get('/search/mastodon/:accountId', async (c) => {
	const accountId = c.req.param("accountId");
	if(! accountId) {
		return c.json({error: 'accountId is required'}, 400);
	}
	if( ! isValidAccontId(accountId,'mastodon') ){
		return c.json({error: 'account not found'}, 404);
	}

	const api = new MastodonApi(instanceUrl);
	const account = await api.getAccountById(accountId,instanceUrl);
	if( !  account ){
		return c.json({error: 'account not found'}, 404);
	}
	return c.json({accountId,account,});
});


app.get('/search/mastodon/:accountId/statuses', async (c) => {
	const accountId = c.req.param("accountId");
	if(! accountId) {
		return c.json({error: 'accountId is required'}, 400);
	}
	const maxId = c.req.query("maxId") || undefined;

	const api = new MastodonApi(instanceUrl);
	const statuses = await api.getStatuses({accountId,maxId});
	const lastId = statuses[statuses.length - 1].id;
	return c.json({
		maxId,
		cursor:`maxId=${lastId}`,
		next: `${searchUrlApi}/mastodon/${accountId}/statuses?maxId=${lastId}`,
		statuses,
		accountId,
	});
})


app.get('/search/bluesky/:did', async (c) => {
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
	try {
		const agent = await tryBskyLogin({
			identifier: account?.name,
			password: c.env.JOSH412_BSKY,

		});
		const details = await getBluskyAccount({
			agent: agent.agent,
			username: account.name,
		});
		return c.json({did,account,details});
	} catch (error) {

	}
});

app.get('/search/bluesky/:did/statuses', async (c) => {
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
		const statuses = await getBlueskyStatuses({
			agent: agent.agent,
			actor: account.did,
			cursor,
		});
		return c.json({
			did,
			next: `${searchUrlApi}/bluesky/${did}/statuses?cursor=${statuses.statusesCursor}`,
			nextCursor:statuses.statusesCursor,
			statuses:statuses.statuses,
		});
	} catch (error) {
		return c.json({error: 'Error'}, 500);
	}
});

//Likes
app.get('/search/bluesky/:did/likes', async (c) => {
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
		const statuses = await getBskyLikes({
			agent: agent.agent,
			actor: account.did,
			cursor,
		});
		return c.json({
			next: `${searchUrlApi}/bluesky/${did}/likes?cursor=${statuses.likesCursor}`,
			nextCursor:statuses.likesCursor,
			statuses:statuses.likes
		});
	} catch (error) {
		return c.json({error: 'account not found'}, 404);
	}
});



//Timeline
app.get('/search/bluesky/:did/timeline', async (c) => {
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

app.get('/search', async (c) => {
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

export default {
	fetch: app.fetch,
};

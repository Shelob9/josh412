
import { AppBskyFeedDefs } from "@atproto/api";
import config from "@lib/config";
import {
	BskyPostSimple,
	getBlueskyStatuses, getBlueskyTimeline, getBluskyAccount, getBskyLikes,
	MastodonApi, tryBskyLogin
} from '@social';
import { Hono } from 'hono';
import { cache } from 'hono/cache';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

const {  uri } = config;
const cacheSeconds = 600;
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
} {
	return config.social.mastodon.find( a => a.accountId === accountId) as {
		name: string,
		instanceUrl: string,
		accountId: string
	};

}

function blueskyDidToCongig(did:string): {name:string,did:string} | undefined {
	return config.social.bluesky.find( a => a.did === did);
}
function postUriToUrl(uri:string,authorHandle:string){
    //take only the part after app.bsky.feed.post/ in uri
    uri = uri.split('/').slice(-1)[0];
    return `https://bsky.app/profile/${authorHandle}/post/${uri}`;

}


const workerName = 'search';

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
app.use(
	'/search/*',
	cors({
	  origin: 'http://localhost:2112',
	  allowMethods: ['POST', 'GET', 'OPTIONS'],
	  maxAge: cacheSeconds,
	  credentials: true,
	})
  )
app.get(
	'*',
	cache({
	  cacheName: workerName,
	  cacheControl: `max-age=${cacheSeconds}`,
	})
)
app.get('/search/mastodon/:accountId', async (c) => {
	const accountId = c.req.param("accountId");
	if(! accountId) {
		return c.json({error: 'accountId is required'}, 400);
	}
	if( ! isValidAccontId(accountId,'mastodon') ){
		return c.json({error: 'account not found'}, 404);
	}
	const {instanceUrl} = mastodonAccountIdToConfig(accountId);
	const api = new MastodonApi(instanceUrl);
	const account = await api.getAccountById(accountId,instanceUrl);
	if( !  account ){
		return c.json({error: 'account not found'}, 404);
	}
	if (c.req.query("q")) {
		const instanceUrl = c.req.query("instanceUrl") || undefined;
		const following = c.req.query("following") || false;
		const accountId = c.req.query("accountId") || undefined;
		const statuses = await api.search(c.req.query("q") as string,{
			instanceUrl,
			following: following ? true : undefined,
			account_id: accountId ? accountId : undefined,
		});
		return c.json({accountId,account,statuses});
	}

	return c.json({accountId,account,});
});


app.get('/search/mastodon/:accountId/statuses', async (c) => {
	const accountId = c.req.param("accountId");
	if(! accountId) {
		return c.json({error: 'accountId is required'}, 400);
	}
	const maxId = c.req.query("maxId") || undefined;
	const {instanceUrl} = mastodonAccountIdToConfig(accountId);

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
		try {
			const statuses = await getBlueskyStatuses({
				agent: agent.agent,
				actor: account.did,
				cursor,
			});
			function statusToSimple(s:AppBskyFeedDefs.FeedViewPost):BskyPostSimple|undefined {
				const {post} = s;
				if( ! post ){
					return undefined;
				}

				const {uri,cid,author,record,replyCount,likeCount,repostCount,} = post;
				const {handle} = author;
				const url = postUriToUrl(uri,handle);
				if( s.reply && s.reply.root ){
					console.log( s.reply);
				}
				return {
					uri,
					cid,
					url,
					author: {
						url: `https://bsky.app/profile/${handle}`,
						avatar: author.avatar ?? '',
						displayName: author.displayName?? '',
						handle,
						did: author.did,
					},
					//@ts-ignore
					text: record.text,
					replyCount: replyCount ?? 0,
					likeCount: likeCount ?? 0,
					repostCount: repostCount ?? 0,
					//@ts-ignore
					hasrSr: s.reply && s.reply.root ? true : false,
					//reply: s.reply && s.reply.root ? s.reply.root.cid : false
				}
			}
			const returnStatuses = statuses.statuses.map(statusToSimple).filter( s => s !== undefined) as BskyPostSimple[];
			return c.json({
				did,
				next: `${searchUrlApi}/bluesky/${did}/statuses?cursor=${statuses.statusesCursor}`,
				nextCursor:statuses.statusesCursor,
				statuses:	returnStatuses

			});
		} catch (error) {
			console.log(error);
			return c.json({error: 'Error1'}, 501);

		}
	} catch (error) {
		console.log(error);
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

app.notFound(async (c) => {
	return c.json({error: 'Not found'}, 404);
});

export default {
	fetch: app.fetch,
};


import { AppBskyFeedDefs } from "@atproto/api";
import config from "@lib/config";
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { Bindings, Variables } from "../../app.types";
import {
	blueskyDidToCongig,
	blueskyPostUriToUrl,
	BskyPostSimple,
	getBlueskyStatuses, getBlueskyTimeline, getBluskyAccount, getBskyLikes,
	isValidAccontId,
	mastodonAccountIdToConfig,
	MastodonApi, tryBskyLogin
} from '../social';

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
	const {instanceUrl} = mastodonAccountIdToConfig(accountId);
	const api = new MastodonApi(instanceUrl);
	const account = await api.getAccountById(accountId,instanceUrl);
	if( !  account ){
		return c.json({error: 'account not found'}, 404);
	}
	if (c.req.query("q")) {
		const instanceUrl = c.req.query("instanceUrl") || undefined;
		const following = c.req.query("following") || false;
		const queryAccountId = c.req.query("accountId") || undefined;
		const q = c.req.query("q") as string || '';
		const statuses = await api.search(q as string,{
			instanceUrl,
			following: following ? true : undefined,
			account_id: queryAccountId ?? accountId
		});
		return c.json({accountId,account,statuses,q});
	}

	return c.json({accountId,account,});
});


api.get('/mastodon/:accountId/statuses', async (c) => {
	const accountId = c.req.param("accountId");
	if(! accountId) {
		return c.json({error: 'accountId is required'}, 400);
	}
	const maxId = c.req.query("maxId") || undefined;
	const {instanceUrl} = mastodonAccountIdToConfig(accountId);
	const api = new MastodonApi(instanceUrl);
	try {
		const statuses = await api.getStatuses({accountId,maxId});
		const lastId = statuses[statuses.length - 1].id;
		return c.json({
			maxId,
			cursor: maxId ? `maxId=${maxId}` :undefined,
			nextCursor:lastId ? `maxId=${lastId}` : undefined,
			next: `${searchUrlApi}/mastodon/${accountId}/statuses?maxId=${lastId}`,
			statuses,
			accountId,
		});
	} catch (error) {
		console.log({error});
		return c.json({error: 'Could not get statuses'}, 400);

	}
})


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
			const statuses = await getBlueskyStatuses({
				agent: agent.agent,
				actor: account.did,
				cursor,
			});

			function postImageToUrl(authorDid:string,link:string,type:string){

				return `https://cdn.bsky.app/img/feed_thumbnail/plain/${authorDid}/${link}@${type.replace('image/','')}`;
			}


			function statusToSimple(s:AppBskyFeedDefs.FeedViewPost):BskyPostSimple|undefined {
				const {post} = s;
				if( ! post ){
					return undefined;
				}



				const {uri,cid,author,record,replyCount,likeCount,repostCount,} = post;
				const {handle} = author;
				const url = blueskyPostUriToUrl(uri,handle);
				//@ts-ignore
				const images = record.embed?.images ?? [];

				return {
					uri,
					cid,
					url,
					//@ts-ignore
					createdAt: record.createdAt ?? '',
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
					//@ts-ignore
					images: record.embed?.images ? record.embed.images.map(image => {
						const id = image.image.ref.toString();
						const url = postImageToUrl(author.did, id,image.image.mimeType);
						return {
								description: image.alt,
								url,
								preview_url: url,
								id
						}
					}) :[],
					//@ts-ignore
					reply: s.reply && s.reply.root && s.reply.root.$type === 'app.bsky.feed.defs#postView' ? {
						"uri": s.reply.root.uri,
						"cid":  s.reply.root.cid,
						//@ts-ignore
						"url": blueskyPostUriToUrl(s.reply.root.uri,s.reply.root.author.handle),
						author: {
							//@ts-ignore
							url: `https://bsky.app/profile/${s.reply.root.author.handle}`,
							//@ts-ignore
							avatar: s.reply.root.author.avatar ?? '',
							//@ts-ignore
							displayName: s.reply.root.author.displayName?? '',
							//@ts-ignore
							handle: s.reply.root.author.handle,
							//@ts-ignore
							did: s.reply.root.author.did,
						},
						//@ts-ignore
						"text": s.reply.root.record.text,
						"replyCount": s.reply.root.replyCount,
						"likeCount": s.reply.root.likeCount,
						"repostCount": s.reply.root.repostCount,
					} : false
				}
			}


			const returnStatuses = statuses.statuses.map(statusToSimple).filter( s => s !== undefined) as BskyPostSimple[];
			return c.json({
				did,
				cursor: cursor ? `cursor=${cursor}`:undefined,
				next: `${searchUrlApi}/bluesky/${did}/statuses?cursor=${statuses.statusesCursor}`,
				nextCursor:statuses.statusesCursor ? `cursor=${statuses.statusesCursor}`:undefined,
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
api.get('/bluesky/:did/likes', async (c) => {
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

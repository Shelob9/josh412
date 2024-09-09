import { blueskyPostUriToUrl, BskyPostSimple, Get_Bsky_Statuses_Args, getBlueskyStatuses, } from '@app/social';
import { AppBskyFeedDefs } from '@atproto/api';
function blueskyPostImageToUrl(authorDid:string,link:string,type:string){

	return `https://cdn.bsky.app/img/feed_thumbnail/plain/${authorDid}/${link}@${type.replace('image/','')}`;
}

export async function fetchBlueskyStatusesSimple({agent,actor,cursor,makeNextUri}:Get_Bsky_Statuses_Args){
    const statuses = await getBlueskyStatuses({
        agent,
        actor,
        cursor,
    })
    const did = actor;

    const returnStatuses = statuses.statuses.map(BlueskyStatusToSimple).filter( s => s !== undefined) as BskyPostSimple[];
	const next = makeNextUri ? makeNextUri(did,statuses.statusesCursor):`/bluesky/${did}/statuses?cursor=${statuses.statusesCursor}`;
	return {
        did,
        cursor: cursor ? `cursor=${cursor}`:undefined,
        next,
        nextCursor:statuses.statusesCursor ? `cursor=${statuses.statusesCursor}`:undefined,
        statuses:	returnStatuses

    };
}
export default function BlueskyStatusToSimple(s:AppBskyFeedDefs.FeedViewPost):BskyPostSimple|undefined {
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
			const url = blueskyPostImageToUrl(author.did, id,image.image.mimeType);
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

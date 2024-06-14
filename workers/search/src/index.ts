
import config from "@lib/config";
import { MastodonApi } from '@social';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
const { cacheSeconds, uri } = config;

type SOCIAL_NETWORK = 'mastodon' | 'bluesky';
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
export interface Env {

}
const instanceUrl = 'https://mastodon.social';
const accountId = 425078;
//`/mastodon/425078/statuses`
const app = new Hono<{ Bindings: {}; Variables: {} }>({ strict: false });

app.use('*', logger());
app.get('/mastodon/:accountId', async (c) => {
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

app.get('/mastodon/:accountId/statuses', async (c) => {
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
		statuses,
		accountId,
	});
})


export default {
	fetch: app.fetch,
};

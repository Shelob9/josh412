
import config from "@lib/config";
import { MastodonApi } from '@social';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
const { cacheSeconds, uri } = config;
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
	console.log({maxId});

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

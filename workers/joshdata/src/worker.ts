import { DrizzleD1Database, drizzle } from 'drizzle-orm/d1';
import { INSERT_CLASSIFICATION, classifications } from './db/schema';
import {  getAccount, getStatus, getStatuses } from './social/mastodon';
import { Status } from './social/types/mastodon'
import { getToots, injestToots } from './handlers/mastodon';
import { Router } from '@tsndr/cloudflare-worker-router'
import { jsonReponse } from './responseFactory';
import { Env } from './env';
// Initialize router
const router = new Router<Env>()

// Register global middleware
router.use(({ env, req }) => {
    // Intercept if token doesn't match
    if (req.headers.get('authorization') !== env.SECRET_TOKEN){
		//	return new Response(null, { status: 401 })
	}
})

router.get('/api/mastodon' , getToots );
router.get('/api/mastodon/injest' , injestToots );
router.get('/api/hi', async ({ req }: {req: Request}) => {
	return jsonReponse({
		hi: 'Roy',
	},420);
});
router.get('/api/' , async ({ req }: {req: Request}) => {
	return jsonReponse({
		routes: {
			'/api/': 'this',
			'/api/hi': 'hello',
			'/api/mastodon': 'all toots',
			'/api/mastodon/injest': 'injest toots',
		}
	},200);
});

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return router.handle(request, env, ctx)
	}
};

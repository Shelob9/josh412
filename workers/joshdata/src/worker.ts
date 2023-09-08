import { DrizzleD1Database, drizzle } from 'drizzle-orm/d1';
import { SAVED_CLASSIFICATION, INSERT_CLASSIFICATION, TABLE_classifications } from './db/schema';
import {  getAccount, getStatus, getStatuses } from './social/mastodon';
import { Status } from './social/types/mastodon'
import { getToots, injestToots } from './handlers/mastodon';
import { Router } from '@tsndr/cloudflare-worker-router'
import { jsonReponse } from './responseFactory';
import { Env } from './env';
import { eq, sql } from 'drizzle-orm';
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
router.get('/api/test', async ({ env }: {env: Env}) => {
	const db = await drizzle(env.DB1);

	try {
		const one = await db.select().from(TABLE_classifications)
			.where(eq(TABLE_classifications.slug, 'test')
		).limit(1);

		const results = await db.select().from(TABLE_classifications).all();
	//const all = await db.select().from(TABLE_classifications).all();
	return jsonReponse({
		hi: 'Roy',
		//result,
		results,
		one
	},200);
	} catch (error) {
		return jsonReponse({
			// @ts-ignore
			e: error.message,
		},400);
	}


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
//redirect root to /api
router.get('/', async ({ req }: {req: Request}) => {
	return Response.redirect('/api/', 301);
});

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return router.handle(request, env, ctx)
	}
};

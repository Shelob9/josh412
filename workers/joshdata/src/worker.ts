import { DrizzleD1Database, drizzle } from 'drizzle-orm/d1';
import { INSERT_CLASSIFICATION, INSERT_CLASSIFICATION_NO_TS, TABLE_classifications } from './db/schema';
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
router.get('/api/test', async ({ env }: {env: Env}) => {
	const db = await drizzle(env.DB1);
	// type that is INSERT_CLASSIFICATION without created and updated
	const insert = async (
		classification: INSERT_CLASSIFICATION_NO_TS
	) => {
		const now = new Date;

		return db.insert(TABLE_classifications).values({
			...classification,
			created: now,
			updated: now,
		}).run();
	  }

	await insert({
		slug: 'test',
		itemtype: 'test',
		itemid: 'test',

	});
	const all = await db.select().from(TABLE_classifications).all();
	return jsonReponse({
		hi: 'Roy',
		all,
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
//redirect root to /api
router.get('/', async ({ req }: {req: Request}) => {
	return Response.redirect('/api/', 301);
});

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return router.handle(request, env, ctx)
	}
};

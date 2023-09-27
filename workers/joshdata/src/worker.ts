import {  drizzle } from 'drizzle-orm/d1';
import { TABLE_classifications } from './db/schema';
import { deleteToots, getToots, injestToots,getToot, allMastodonClassifications } from './handlers/mastodon';
import { Router } from '@tsndr/cloudflare-worker-router'
import { jsonReponse } from './responseFactory';
import { Env } from './env';
import { and, eq } from 'drizzle-orm';
import { createHandler } from './handlers/createHandler';
import {getStatus} from '@social';
import { allClassifications } from './handlers/classifications';
// Initialize router
const router = new Router<Env>()

// Register global middleware
router.use(({ env, req }) => {
    // Intercept if token doesn't match
    if (req.headers.get('authorization') !== env.SECRET_TOKEN){
		//	return new Response(null, { status: 401 })
	}
})

router.get('/api/classifications' , allClassifications );
router.get('/api/mastodon' , getToots );
router.get('/api/mastodon/classifications', allMastodonClassifications)
router.get('/api/mastodon/s/:id' , getToot );
router.get('/api/mastodon/d' , deleteToots );
//?classify=1
router.get('/api/mastodon/injest' , injestToots );
router.get('/api/hi', async ({ req }: {req: Request}) => {
	const toot = await getStatus('https://mastodon.social','111131517917647244');
	return jsonReponse({
		hi: 'Roy',
		toot,
	},420);
});
router.get('/api/st', async ({ req }: {req: Request}) => {


	// Using our readable and writable to handle streaming data
	let { readable, writable } = new TransformStream()


	let writer = writable.getWriter()
	const textEncoder = new TextEncoder();
	writer.write(textEncoder.encode(`One`))
	writer.write(textEncoder.encode(`TWO`))

	//every two seconds, write Hi Roy and time to the stream
	setInterval(() => {
		writer.write(textEncoder.encode(`Hi Roy ${new Date().toISOString()}\n`))
	}, 2000)
	setTimeout(() => {
		writer.write(textEncoder.encode(`Bye`))
		writer.close()
	}, 4000)


	// Send readable back to the browser so it can read the stream content
	return new Response(readable, {
		status: 200,
		statusText: 'OK',
		headers: { "Content-Type": "text/plain" }
	})
});
router.get('/api/test', async ({ env,req }: {env: Env,req: Request}) => {
	return createHandler(env,req,async (data,url,req) => {
		const statusId = 110986907620507393;
		const network = 'mastodon';
		const api = await data.getStatusApi(network);
		const {status,key,
			//classifications
		} = await api.getSavedStatus({
			instanceUrl: 'mastodon.social',
			statusId: statusId.toString(),
			accountId: '425078',
		});


		const d1 = await drizzle(env.DB1);
		const now = new Date();
		const args = {
			slug:'dog',
			subtype: network,
			itemid: key,
			itemtype: `socialpost`,


		}


		const cG = await api.getOrCreateClassification(args);

		const instanceUrl = "https://mastodon.social";
		const accountId = '425078';
		const classification = await api.getOrCreateClassification({
			slug:'food',
			subtype: network,
			itemid: key,
			itemtype: api.itemType
		});
		const r = await api.saveClassifications({
			key,
			classifications: [
				'gn'
			],
				subtype: network,
				instanceUrl,
				accountId,
		})
		const classifications = await d1.select().from(TABLE_classifications).limit(
			300
		)
		return jsonReponse({
			r,
			classifications: classifications ?? [],
			key,
			status,
			classification

		},200);


	});


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
const rootHandler = async ({ req }: {req: Request}) => {
	return jsonReponse({
		routes: {
			'/api/': 'this',
			'/api/hi': 'hello',
			'/api/mastodon': 'all toots',
			'/api/mastodon/s/:id': 'get toot',
			'/api/mastodon/d': 'delete toots',
			'/api/mastodon/injest': 'injest toots',
		}
	},200);
};
router.get('/api' , rootHandler );
//redirect root to /api
router.get('/', rootHandler );

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return router.handle(request, env, ctx)
	}
};

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
import { collectPhotos } from './handlers/photos';
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
router.get('/api/photos/injest', collectPhotos );
//?classify=1
router.get('/api/mastodon/injest' , injestToots );
router.get('/api/hi', async ({ req }: {req: Request}) => {
	const toot = await getStatus('https://mastodon.social','111131517917647244');
	return jsonReponse({
		hi: 'Roy',
		toot,
	},420);
});


const rootHandler = async ({ req }: {req: Request}) => {
	return jsonReponse({
	},200);
};
router.get('/api' , rootHandler );
//redirect root to /api
router.get('/', rootHandler );

type Injest_Message = {
	direction:'backwards'|'forward';
	network:string;
	instanceUrl:string;
	accountId:string;
	type: 'social_post'|'social_post_image'
}
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return router.handle(request, env, ctx)
	},
	async queue(batch: MessageBatch<Injest_Message>, env: Env): Promise<void> {
		let messages = JSON.stringify(batch.messages);
		console.log(`consumed from our queue: ${messages}`);
	},
};

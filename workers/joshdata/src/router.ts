
import { deleteToots, getToots, injestToots,getToot, allMastodonClassifications, getTootsWithClassification,  } from './handlers/mastodon';
import { Router } from '@tsndr/cloudflare-worker-router'
import { jsonReponse } from './responseFactory';
import { Env } from './env';

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
router.get('/api/mastodon/classifications' , getTootsWithClassification );

router.get('/api/mastodon/s/:id' , getToot );
router.get('/api/mastodon/d' , deleteToots );
router.get('/api/photos/injest', collectPhotos );
//?classify=1
router.get('/api/mastodon/injest' , injestToots );
router.get('/api/hi', async ({ req }: {req: Request}) => {
	const toot = await getStatus('https://mastodon.social','111131517917647244');
	return jsonReponse({
		hi: 'Roy',
		//toot,
	},420);
});


const rootHandler = async ({ req }: {req: Request}) => {
	return jsonReponse({
	},200);
};
router.get('/api' , rootHandler );
//redirect root to /api
router.get('/', rootHandler );


export default router;

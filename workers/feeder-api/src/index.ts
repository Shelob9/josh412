import { DataService } from './data-service';
import { dbSchema } from './db';

import { zValidator } from '@hono/zod-validator';
import { getAccount } from '@social';
import { Hono } from 'hono';
import { cache } from 'hono/cache';
import { prettyJSON } from 'hono/pretty-json';
import z from 'zod';

type Bindings = {
	QSTASH_CURRENT_SIGNING_KEY: string;
    QSTASH_NEXT_SIGNING_KEY: string;
    QSTASH_TOKEN: string;
    UPSTASH_QSTASH_URL: string;
    IMAGE_BUCKET: R2Bucket;
    KV: KVNamespace;
    DB: D1Database;
}
type Variables = {
	DataService: DataService;

}
const makeApp = () => {
	return  new Hono<{
		Bindings: Bindings;
		Variables: Variables;
	 }>();
}
const app = makeApp();
const apiRouter = makeApp();
app.route('/api/v1', apiRouter );

app.get('/hi', (c) => {
	return c.jsonT({
		hi: 'Roy'
	})
})
app.use('*', prettyJSON({ space: 4 }));
app.get(
	'*',
	cache({
	  cacheName: 'feeder-api',
	  cacheControl: 'max-age=1',
	})
  )



app.use('*', async (c, next) => {
	c.set('DataService', new DataService({
		KV: c.env.KV,
		DB: c.env.DB,
		IMAGE_BUCKET: c.env.IMAGE_BUCKET,
		UPSTASH_QSTASH_URL: c.env.UPSTASH_QSTASH_URL,
		QSTASH_TOKEN: c.env.QSTASH_TOKEN,
		QSTASH_CURRENT_SIGNING_KEY: c.env.QSTASH_CURRENT_SIGNING_KEY,
		QSTASH_NEXT_SIGNING_KEY: c.env.QSTASH_NEXT_SIGNING_KEY,
	}));

	await next();
});
apiRouter.get('/accounts', async(c) => {
	try {
		const accounts = await c.get('DataService').accounts.getAccounts(undefined)
		const networks = accounts.map( a => a.network );
		return c.jsonT({
			accounts,
			networks: [...new Set(networks)]
		})
	} catch (error) {
		console.log({error})
		return c.jsonT({
			error
		},400 )
	}
});

apiRouter.get('/accounts/:network', async(c) => {
	const network = c.req.param('network');
	if( ['bluesky', 'mastodon'].indexOf(network) === -1 ){
		return c.jsonT({
			error: `Network ${network} not valid`
		}, 400 );
	}
	try {
		const accounts = await c.get('DataService').accounts.getAccounts(network as dbSchema.FEEDER_ALLOWED_NETWORK)
		return c.jsonT({
			accounts,
			network
		})
	} catch (error) {
		return c.jsonT({
			error
		},400 )
	}
});
apiRouter.get('/accounts/k/:accountKey', async (c) => {
	const accountKey = c.req.param('accountKey')
	if( ! accountKey ){
		return c.jsonT({
			error: `No account key ${accountKey} found`
		}, 400 );
	}
	try {
		const account = await c.get('DataService').accounts.getAccount(accountKey);
		return c.jsonT({
			account,
			accountKey
		})
	} catch (error) {
		return c.jsonT({
			error
		},400 )
	}
})
//Create an account
const networkSchema = z.enum(['bluesky', 'mastodon']);
const accountCreateSchema = z.object({
	network: networkSchema,
	instanceUrl: z.string().url(),
	accountHandle: z.string(),
});
apiRouter.post('/accounts',zValidator('json', accountCreateSchema ), async (c) => {
	const json = await c.req.json();
	// ensure ends with /
	const instanceUrl = json.instanceUrl.endsWith('/') ? json.instanceUrl : `${json.instanceUrl}/`;
	// get the account id from api
	try {
		const mastodonAccount = await getAccount(instanceUrl, json.accountHandle.replace('@',''));

		if( ! mastodonAccount ){
			return c.jsonT({
				error: `No account found for ${json.instanceUrl} ${json.accountHandle}`
			}, 400 );
		}
		try {
			const accountKey = await c.get('DataService').accounts.createAccount({
				...json,
				accountId: mastodonAccount.id,
			});
			return c.jsonT({
				accountKey,
			},201 )
		} catch (error) {
			console.log({error});
			return c.jsonT({
				error
			},400 )
		}
	}catch(e){
		console.log(e);
		return c.jsonT({
			error: `Error trying to find account for ${json.instanceUrl} ${json.accountHandle}`
		}, 400 );
	}


})

//add account token
const saveTokenSchema = z.object({
	token: z.string(),
});

apiRouter.post('/accounts/:accountKey/token', zValidator('json', saveTokenSchema),async (c) => {
	const accountKey = c.req.param('accountKey')
	const has = await c.get('DataService').accounts.hasAccount(accountKey);
	if( ! has ){
		return c.jsonT({
			error: `No account key ${accountKey} found`
		}, 400 );
	}
	const json = await c.req.json();
	try {
		await c.get('DataService').accounts.saveAccountToken(accountKey, json.token);
		return c.jsonT({
			accountKey,
		},201 )
	} catch (error) {
		console.log({error});
		return c.jsonT({
			error
		},400 )
	}
});
// delete an account
apiRouter.delete('/accounts/:accountKey', async (c) => {

	const accountKey = c.req.param('accountKey')
	const has = await c.get('DataService').accounts.hasAccount(accountKey);
	if( ! has ){
		return c.jsonT({
			error: `No account key ${accountKey} found`
		}, 400 );
	}

	try {
		const account = await c.get('DataService').accounts.getAccount(accountKey);
		if( ! account ){
			return c.jsonT({
				error: `No account key ${accountKey} found`
			}, 400 );
		}
		await c.get('DataService').accounts.deleteAccount(accountKey);
		return c.jsonT({

		}, 204 );
	} catch (error) {
		return c.jsonT({
			error
		},400 )
	}
});

app.get('/test', async(c) => {

	const count = await c.get('DataService').counts();
	return c.jsonT({
		count
	});
})
apiRouter.post('/test', async(c) => {
	let count = 0;
	const saved = await c.get('DataService').kv.get('count');
	if( saved ){
		count = parseInt(saved,10);
	}
	await c.get('DataService').kv.put('count', (count + 1).toString());
	const value = await c.get('DataService').kv.get('count') || 0;
	return c.jsonT({
		count:value
	});
})
apiRouter.get('/', async(c) => c.json({
	worker: 'feeder-api',
}))

apiRouter.post('/schedule', zValidator('json', z.object({
	text: z.string(),
    mediaKeys: z.array(z.string()).optional(),
    sendAt: z.coerce.date(),
    accountKey: z.string(),
})), async (c) => {
	const json = await c.req.json();
	const post = await c.get('DataService').scheduledPosts.savePost(json);
	//@todo actually scheduale the post
	return c.jsonT({
		post
	}, 201);

});
apiRouter.get('/scheduled/:accountKey', async (c) => {
	const accountKey = c.req.param('accountKey')
	const account = await c.get('DataService').accounts.getAccount(accountKey);
	if( ! account ){
		return c.json({
			error: `No account key ${accountKey} found`,
			posts: [],
			accountKey
		}, 400 );
	}
	const posts = await c.get('DataService').scheduledPosts.getSavedPosts(account);
	if( ! posts ){
		return c.jsonT({
			error: `No posts found for account ${accountKey}`,
			posts: [],
			accountKey
		}, 400 );
	}
	return c.json({
		error: '',
		posts: posts ?? [],
		accountKey
	})


});

apiRouter.delete('scheduled/:postKey', async (c) => {
	const postKey = c.req.param('postKey')
	const post = await c.get('DataService').scheduledPosts.getSavedPost(postKey);
	if( ! post ){
		return c.jsonT({
			error: `No post key ${postKey} found`,
			postKey
		}, 400 );
	}
	try {
		await c.get('DataService').scheduledPosts.deletePost(post);
		return c.jsonT({
			error: null,
			postKey
		})
	} catch (error) {
		return c.jsonT({
			error,
			postKey
		},400 )
	}
});

apiRouter.put('scheduled/:postKey/sent', async (c) => {
	const postKey = c.req.param('postKey')
	const post = await c.get('DataService').scheduledPosts.getSavedPost(postKey);
	if( ! post ){
		return c.jsonT({
			error: `No post key ${postKey} found`,
			postKey
		}, 400 );
	}
	try {
		await c.get('DataService').scheduledPosts.markPostAsSent(post);
		return c.jsonT({
			error: null,
			postKey
		})
	} catch (error) {
		return c.jsonT({
			error,
			postKey
		},400 )
	}
})
app.showRoutes();
app.route('/api', apiRouter );
app.route('/api/v1', apiRouter );
export default app

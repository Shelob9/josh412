import { blueskyDidToCongig, isValidAccontId, mastodonAccountIdToConfig } from "@app/social";
import { Hono } from "hono";
import { Bindings, Variables } from "../../app.types";
import { numberArg } from "./util/numberArg";

const api = new Hono<{Variables: Variables,Bindings:Bindings}>();



api.get('/', async (c) => {
    const route = 'GET /items';
    const itemsDb = c.get('ItemsApi');

    const source = c.req.query('source') || undefined;
    const sourceType = c.req.query('sourceType') || undefined;
    const page = numberArg(c.req,'page');
    try {
        const items = await itemsDb.all({
            page: page,
            perPage:numberArg(c.req,'perPage'),
            source,
            sourceType,
            withClassification: true,

        });
        const totalPages = await itemsDb.totalPages({
            source,
            sourceType,
            perPage:numberArg(c.req,'perPage'),
        });
        return c.json({ items,route,nextCursor: page ?page + 1 : 2,totalPages });
   } catch (e) {
     return c.json({ err: e.message,route }, 500);
   }

});

api.get('/sourcetype/:sourceType', async (c) => {
    const itemsDb = c.get('ItemsApi');
    const sourceType = c.req.param('sourceType');
    const route = 'GET /items/sourcetype/:sourceType';
    const page = numberArg(c.req,'page');
    try {
        const items = await itemsDb.all({
            page,
            perPage:numberArg(c.req,'perPage'),
            sourceType,
            withClassification: true,
        });
        const totalPages = await itemsDb.totalPages({
            sourceType,
            perPage:numberArg(c.req,'perPage'),
        });
        return c.json({ items,route,nextCursor: page ?page + 1 : 2,totalPages });
   } catch (e) {
     return c.json({ err: e.message,route }, 500);
   }

});

api.get('/source/:source', async (c) => {
    const source = c.req.param('source');

    const route = 'GET /items/source/:source';
    const itemsDb = c.get('ItemsApi');
    const page = numberArg(c.req,'page');

    try {
        const items = await itemsDb.all({
            page,
            perPage:numberArg(c.req,'perPage'),
            source,
            withClassification: true,
        });
        const totalPages = await itemsDb.totalPages({
            source,
            perPage:numberArg(c.req,'perPage'),
        });
        return c.json({ items,route,nextCursor: page ?page + 1 : 2,totalPages });
   } catch (e) {
     return c.json({ err: e.message,route }, 500);
   }

});

api.get('/media/:source', async (c) => {
    const source = c.req.param('source');

    const route = 'GET /items/media/:source';
    const itemsDb = c.get('ItemsApi');
    const page = numberArg(c.req,'page');

    try {
        const items = await itemsDb.getSourceMedia({
            page,
            perPage:numberArg(c.req,'perPage'),
            // @ts-ignore
            source,
        });
        const totalPages = await itemsDb.totalPages({
            source,
            perPage:numberArg(c.req,'perPage'),
        });
        return c.json({ items,route,nextCursor: page ?page + 1 : 2,totalPages });
   } catch (e) {
     return c.json({ err: e.message,route }, 500);
   }

});

api.get('/search', async (c) => {
    const query = c.req.query("q");
    const itemsDb = c.get('ItemsApi');
    const route = 'GET /items/search';
    if( ! query) {
        return c.json({ err: "q is required",route });
    }
    try {
        const items = await itemsDb.search({
            query,
            page: numberArg(c.req,'page',1) as number,
            perPage:numberArg(c.req,'perPage',25)as number,
        });
        return c.json({ items,route });
    } catch (e) {
        return c.json({ err: e.message,route }, 500);
    }
});

api.post('injest/bluesky/:did', async (c) => {
    const did = c.req.param("did");

	if(! did) {
		return c.json({error: 'did is required',did}, 400);
	}
	if( ! isValidAccontId(did,'bluesky') ){
		return c.json({error: 'account not found'}, 404);
	}
	const account = blueskyDidToCongig(did);
	if( ! account ){
		return c.json({error: 'account not found'}, 404);
	}
	const cursor = c.req.query("cursor") || undefined;
    const injestor = c.get('Injestor');
	try {

        const returnValue = await injestor.injestBlueSky({
            did,
            cursor,
            bluesky: {
                identifier: account?.name,
			    password: c.env.JOSH412_BSKY,
            }
        });

            return c.json(returnValue);

    } catch (error) {
        //console.log({error});
        return c.json({error: 'Error1'}, 501);

    }


});

api.post('/injest/mastodon/:accountId', async (c) => {
    const accountId = c.req.param("accountId");
	if(! accountId) {
		return c.json({error: 'accountId is required'}, 400);
	}
	const maxId = c.req.query("maxId") || undefined;
	try {
        const {instanceUrl,slug} = mastodonAccountIdToConfig(accountId);
        const injestor = c.get('Injestor');
        const returnValue = await injestor.injestMastodon({
            accountId,
            maxId,
            instanceUrl,
            slug
        });
        return c.json(returnValue);
    } catch (error) {
        return c.json({ err: error.message,accountId }, 500);
    }





});
api.get('/authors', async (c) => {
    const itemsDb = c.get('ItemsApi');
    const route = 'GET /authors';
    try {
        const authors = await itemsDb.allRemoteAuthors({
            page: 1,
            perPage:25
        });
        return c.json({ authors,route });
    } catch (e) {
        return c.json({ err: e.message,route }, 500);
    }
});
api.get('/sources', async (c) => {
    const itemsDb = c.get('ItemsApi');
    const route = 'GET /sources';
    try {
        const sources = await itemsDb.allSources({
            page: 1,
            perPage:25
        });
        return c.json({ sources,route });
    } catch (e) {
        return c.json({ err: e.message,route }, 500);
    }
});

api.get('/:uuid', async (c) => {
    const uuid = c.req.param('uuid');
    const itemsDb = c.get('ItemsApi');

    if( ! uuid) {
           return c.json({ err: "uuid is required",route:'/items/:uuid' });
    }
    try {
        const item = await itemsDb.get(uuid);
        return c.json({ item,uuid, route:'/items/:uuid' });
    } catch (e) {
        return c.json({ err: e.message, uuid,route:'/items/:uuid'}, 500);
    }
});

api.post('/', async (c) => {
    const route = 'POST /items';
    const itemsDb = c.get('ItemsApi');
    try {
        const body = await c.req.json() as {
            content: string,
            remoteId: string,
            remoteAuthorId: string,
            remoteReplyToId?: string,
            source: {
                uuid?: string,
                type: string
                url: string
            },
            remoteAuthor:{
                uuid?: string,
                remoteId: string,
                remoteHandle: string,
                remoteDisplayName?: string | null,
                source: {
                    uuid?: string,
                    type: string
                    url: string
                },
            },
            createdAt?: string,

        };
        //@todo: validate body
        const uuid = await itemsDb.create(body);
        return c.json({ route,uuid,get: c.get('makeUrl')(`/api/items/${uuid}`) });
    } catch (e) {
        return c.json({ err: e.message,route }, 500);
    }
})
api.delete('/:uuid', async (c) => {
    const itemsDb = c.get('ItemsApi');

    const uuid = c.req.param('uuid');
    const route = 'DELETE /items/:uuid';
    if( ! uuid) {
        return c.json({ err: "uuid is required",route,uuid });
    }
    try {
        await itemsDb.delete(uuid);
        return c.json({ route,uuid });
    } catch (e) {
        return c.json({ err: e.message,route,uuid }, 500);
    }
});

export default api;

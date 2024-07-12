import { mastodonAccountIdToConfig, MastodonApi } from "@app/social";
import { Hono } from "hono";
import { Bindings, Variables } from "../../app.types";

const api = new Hono<{Variables: Variables,Bindings:Bindings}>();


api.get('/', async (c) => {
    const route = 'GET /items';
    const itemsDb = c.get('ItemsApi');

    try {
        const items = await itemsDb.all({
            page: 1,
            perPage:25
        });
        return c.json({ items,route });
   } catch (e) {
     return c.json({ err: e.message,route }, 500);
   }

});

api.get('/injest/mastodon/:accountId', async (c) => {
    const accountId = c.req.param("accountId");
	if(! accountId) {
		return c.json({error: 'accountId is required'}, 400);
	}
	const maxId = c.req.query("maxId") || undefined;
	const {instanceUrl} = mastodonAccountIdToConfig(accountId);


    const itemsDb = c.get('ItemsApi');
    const api = new MastodonApi(instanceUrl);
	try {
        const statuses = await api.getStatuses({accountId,maxId});
        const lastId = statuses[statuses.length - 1].id;
        try {
            const items = await itemsDb.injestMastodon({statuses});
            return c.json({
                maxId,
                cursor:`maxId=${lastId}`,
                next: `$/mastodon/${accountId}/statuses?maxId=${lastId}`,
                statuses,
                accountId,
                items: items.map( i => {
                    return {
                        uuid: i.uuid,
                        remoteId: i.remoteId,
                    }
                } )
            });
        } catch (error) {
            return c.json({ err: error.message,accountId }, 500);
        }
    } catch (error) {
        return c.json({ err: error.message,accountId }, 500);
    }


});

api.get('/sources/:sourceId', async (c) => {
    const sourceId = c.req.param('sourceId');
    const itemsDb = c.get('ItemsApi');
    const route = 'GET /items/:sourceUuid';
    if( ! sourceId) {
        return c.json({ err: "sourceUuid is required",route,sourceUuid });
    }
    try {
        const items = await itemsDb.getBySourceUuid({
            page: 1,
            perPage:25,
            sourceId
        });
        if( ! items) {
            return c.json({ err: "No items found",route,sourceId });
        }
        return c.json({ items,route,sourceId });
    } catch (e) {
        return c.json({ err: e.message,route,sourceId }, 500);
    }
})

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
            }

        };
        //@todo: validate body
        const uuid = await itemsDb.create(body);
        return c.json({ route,uuid,get: `/api/items/${uuid}` });
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

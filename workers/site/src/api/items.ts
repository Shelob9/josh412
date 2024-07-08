import { Hono } from "hono";
import { Bindings, Variables } from "../../app.types";
import ItemsApi from "./database/Items";

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

api.get('/:uuid', async (c) => {
    const uuid = c.req.param('uuid');
    if( ! uuid) {
           return c.json({ err: "uuid is required",route:'/items/:uuid' });
    }
    try {
        const item = await c.get<ItemsApi>('ItemsApi').get(uuid);
        return c.json({ item,uuid, route:'/items/:uuid' });
    } catch (e) {
        return c.json({ err: e.message, uuid,route:'/items/:uuid'}, 500);
    }
});

api.post('/', async (c) => {
    const route = 'POST /items';
    try {
        const body = await c.req.json();

        if(!body.remote_id || !body.item_type) {
            return c.json({
                err: "remote_id and item_type are required",
                body,
                route
            });
        }
        const uuid = await c.get<ItemsApi>('ItemsApi').create({
            remote_id: body.remote_id,
            item_type: body.item_type,
            content: body.hasOwnProperty('content') ? body.content : undefined,
        });
        return c.json({ route,uuid,get: `/api/items/${uuid}` });
    } catch (e) {
        return c.json({ err: e.message,route }, 500);
    }
})
api.delete('/:uuid', async (c) => {
    const uuid = c.req.param('uuid');
    const route = 'DELETE /items/:uuid';
    if( ! uuid) {
        return c.json({ err: "uuid is required",route,uuid });
    }
    const itemApi = c.get<ItemsApi>('ItemsApi') as ItemsApi;
    try {
        await ItemsApi.delete(uuid);
        return c.json({ route,uuid });
    } catch (e) {
        return c.json({ err: e.message,route,uuid }, 500);
    }
});
export default api;

import { Hono } from "hono";
import { honoType } from "../../app.types";
import ClippingsApi from "./database/Clippings";
const api = new Hono<honoType>();




 api.get('/:uuid', async (c) => {
     const uuid = c.req.param('uuid');
     if( ! uuid) {
            return c.json({ err: "uuid is required",route:'/clippings/:uuid' });
    }
     try {
         const clipping = await c.get<ClippingsApi>('clippings').get(uuid);
         return c.json({ clipping,uuid, route:'/clippings/:uuid' });
     } catch (e) {
         return c.json({ err: e.message, uuid,route:'/clippings/:uuid'}, 500);
     }
 });
 api.get('/', async (c) => {
    const route = 'GET /clippings';
    const clippingsDb = c.get('clippings') as ClippingsApi

    try {
        const clippings = await clippingsDb.all();
        return c.json({ clippings,route });
   } catch (e) {
     return c.json({ err: e.message,route }, 500);
   }

});
 api.post('/', async (c) => {
    const route = 'POST /clippings';
     try {
         const body = await c.req.json();

         if(!body.domain || !body.text) {
             return c.json({
                 err: "domain and text are required",
                 body,
                    route
             });
         }
         const uuid = await c.get<ClippingsApi>('clippings').create({
                domain: body.domain,
                text: body.text,
                path: body.hasOwnProperty('path') ? body.path : undefined,
         });
         return c.json({ route,uuid,get: `/api/clippings/${uuid}` });
     } catch (e) {
         return c.json({ err: e.message }, 500);
     }
 });

 api.put('/:uuid', async (c) => {
     const uuid = c.req.param('uuid');
     const route = 'GET /clippings/:uuid';
    if( ! uuid) {
        return c.json({ err: "uuid is required",route,uuid });
    }

    const clippingsDb = c.get('clippings') as ClippingsApi

    try {
        const clipping = await clippingsDb.get(uuid);
        console.log({clipping});
    } catch (error) {
        console.log({error});

            console.log(2);
            return c.json({ err: "Not found",uuid,route }, 404);

    }


     try {
        const body = await c.req.json();
        await clippingsDb.update({
            uuid,
            text: body.text
        });
        const updated = await clippingsDb.get(uuid);
        return c.json({ clipping:updated,uuid,route });
     } catch (e) {
         return c.json({ err: e.message,route }, 500);
     }
 });

 api.delete('/:uuid', async (c) => {
    const uuid = c.req.param('uuid');
    try {
        const { changes } = await c.env.DB.prepare(
            "DELETE FROM clippings WHERE uuid = ?",
        )
            .bind(uuid)
            .run();
        return c.json({ deleted:true,uuid });
    } catch (e) {
        return c.json({ deleted:false,err: e.message }, 500);
    }
});
 export default api;

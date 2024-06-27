import { Hono } from "hono";
import { honoType } from "../../app.types";
import ClassificationsApi from "./database/Classifications";
const api = new Hono<honoType>();




 api.get('/:uuid', async (c) => {
    const route = `GET /api/classifications/:uuid`
     const uuid = c.req.param('uuid');
     if( ! uuid) {
            return c.json({ err: "uuid is required",route });
        }
        const service = c.get('ClassificationsApi') as ClassificationsApi;
     try {
         const classification = await service.get(uuid);
         return c.json({ classification,uuid, route });
     } catch (e) {
         return c.json({ err: e.message, uuid,route}, 500);
     }
 });
 api.get('/', async (c) => {
    const route = 'GET /api/classifications';
    const service = c.get('ClassificationsApi') as ClassificationsApi;

    try {
        const classifications = await service.all();
        return c.json({ classifications,route });
   } catch (e) {
     return c.json({ err: e.message,route }, 500);
   }

});
 api.post('/', async (c) => {
    const route = 'POST /api/classifications';
    const service = c.get('ClassificationsApi') as ClassificationsApi;

     try {
         const body = await c.req.json();

         if(!body.classification || !body.item) {
             return c.json({
                 err: "classification and item are required",
                 body,
                 route
             });
         }
         const uuid = await service.create({
                classification: body.classification,
                item: body.item,
                parent: body.hasOwnProperty('parent') ? body.parent : undefined,
         });
         return c.json({ route,uuid,get: `${route}/${uuid}` });
     } catch (e) {
         return c.json({ err: e.message,route }, 500);
     }
 });



 api.delete('/:uuid', async (c) => {
    const route = 'DELETE /api/classifications/:uuid';
    const service = c.get('ClassificationsApi') as ClassificationsApi;
    const uuid = c.req.param('uuid');
    try {
        await service.delete(uuid);
        return c.json({ deleted:true,uuid });
    } catch (e) {
        return c.json({ deleted:false,err: e.message }, 500);
    }
});
 export default api;

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
        const classifications = await service.all({
            page: 1,
            perPage:25
        });
        return c.json({ classifications,route });
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
        return c.json({ deleted:true,uuid,route });
    } catch (e) {
        return c.json({ deleted:false,err: e.message,route }, 500);
    }
});
 export default api;

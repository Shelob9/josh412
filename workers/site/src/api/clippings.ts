import { Hono } from "hono";
import { honoType } from "../../app.types";
const api = new Hono<honoType>();


type Clipping = {
    uuid: string;
    domain: string;
    path: string;
    text:string
};
class ClippingsApi{
    constructor(private DB: D1Database) {

    }

    async getClipping(uuid:string):Promise<Clipping>{
        const { results } = await this.DB.prepare(
            "SELECT * FROM clippings WHERE uuid = ?",
        )
            .bind(uuid)
            .all();
        if( ! results.length) {
            throw new Error("Not found");
        }
        return results[0];
    }

    async updateClipping({text,uuid}:{
        uuid:string,
        text:string
    }):Promise<boolean>{
        await this.DB.prepare(
            "UPDATE clippings SET text = ? WHERE uuid = ?",
        )
            .bind(text, uuid)
            .run();
        return true;
    }

    async create({domain, path, text}:{
        domain:string,
        text:string,
        path?:string
    }):Promise<string>{
        path = path || '';
        const uuid = crypto.randomUUID();
        await this.DB.prepare(
            "INSERT INTO clippings (uuid, domain, path, text) VALUES (?, ?, ?, ?)",
        )
            .bind(uuid,domain, path, text)
            .run();
        return uuid;
    }

    async delete(uuid:string):Promise<boolean>{
        try {
            await this.DB.prepare(
                "DELETE FROM clippings WHERE uuid = ?",
            )
                .bind(uuid)
                .run();
            return true;

//DOES NOT ACTUALLY THROW
        } catch (error) {
            console.log({error})
            return false
        }
        return true;
    }


}
api.use("*", async (c, next) => {
    c.set('data', new ClippingsApi(c.env.DB));
    await next()
});

 api.get('/:uuid', async (c) => {
     const uuid = c.req.param('uuid');
     if( ! uuid) {
            return c.json({ err: "uuid is required",route:'/clippings/:uuid' });
    }
     try {
         const clipping = await c.get<ClippingsApi>('data').getClipping(uuid);
         return c.json({ clipping,uuid, route:'/clippings/:uuid' });
     } catch (e) {
         return c.json({ err: e.message, uuid,route:'/clippings/:uuid'}, 500);
     }
 });
 api.get('/', async (c) => {
    try {
     let { results } = await c.env.DB.prepare(
       "SELECT * FROM clippings",
     )
       .all();
     return c.json(results);
   } catch (e) {
     return c.json({ err: e.message,route:`clippings` }, 500);
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
         const uuid = await c.get<ClippingsApi>('data').create({
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
    const clipping = await c.get<ClippingsApi>('data').getClipping(uuid);
    if( ! clipping) {
        return c.json({ err: "Not found",uuid,route }, 404);
    }

     try {
        const body = await c.req.json();
        await c.get<ClippingsApi>('data').updateClipping({
            uuid,
            text: body.text
        });
        const updated = await c.get<ClippingsApi>('data').getClipping(uuid);
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

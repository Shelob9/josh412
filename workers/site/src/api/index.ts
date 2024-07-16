import createClient from "@app/db";
import { Hono } from "hono";
import { Bindings, Variables } from "../../app.types";
import classifications from "./classifications";
import clippings from "./clippings";
import ClassificationsApi from "./database/Classifications";
import ClippingsApi from "./database/Clippings";
import ItemsApi from "./database/Items";
import items from "./items";
import search from "./search";

const api = new Hono<{Variables:Variables,Bindings:Bindings}>({ strict: false });
api.use("*", async (c, next) => {
    const prisma = createClient(c.env.DB);
    c.set('prisma', prisma );
    c.set('clippings', new ClippingsApi(prisma));
    c.set('classifications', new ClassificationsApi(prisma));
    c.set('ItemsApi', new ItemsApi(prisma));
    await next()
});
api.get("/status", (c) => c.json({ status: "ok" }));

api.get('/status/db', async (c) => {
     // If you did not use `DB` as your binding name, change it here
     try {
        const { results } = await c.env.DB.prepare("SELECT name FROM sqlite_master WHERE type='table'")
            .all();
        const tables = results.map((r: any) => r.name);
        const schema = {};
        //get columns of each table
        for (const table of tables) {
            if('_cf_KV' === table) continue;
            const { results } = await c.env.DB.prepare(`PRAGMA table_info(${table})`)
                .all();
            schema[table] = results;

        }
        return c.json({ tables,schema });
     } catch (error) {
        return c.json({ error: error.message },500);

     }
});








api.route('/clippings', clippings);
api.route('/classifications', classifications );
api.route('/items', items);
api.route('/search', search);
export default api;

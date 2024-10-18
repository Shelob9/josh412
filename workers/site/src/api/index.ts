import createClient from "@app/db";
import config from "@lib/config";
import { Hono } from "hono";
import { Bindings, Variables } from "../../app.types";
import classifications from "./classifications";
import clippings from "./clippings";
import ClassificationsApi from "./database/Classifications";
import ClippingsApi from "./database/Clippings";
import InjestService from "./database/InjestService";
import ItemsApi from "./database/Items";
import items from "./items";
import search from "./search";

const api = new Hono<{Variables:Variables,Bindings:Bindings}>({ strict: false });

api.use("*", async (c, next) => {
    const prisma = createClient(c.env.DB);
    const makeUrl = (path:string,args?:{[key:string]:string|number|undefined}) => {
        const requestUrl = new URL(c.req.url);
        const newUrl = new URL(`${requestUrl.protocol}//${requestUrl.host}${path}`);
        if(args){
            for (const key in args) {
                newUrl.searchParams.set(key, args[key]);
            }

        }
        return newUrl.toString();
    }
    c.set('makeUrl', makeUrl );
    const classificationsApi = new ClassificationsApi(prisma);
    const itemsApi = new ItemsApi(prisma,c.env.KV);
    c.set('prisma', prisma );
    c.set('clippings', new ClippingsApi(prisma));
    c.set('classifications', classificationsApi);
    c.set('ItemsApi', itemsApi);
    c.set('Injestor', new InjestService(
        classificationsApi,
        itemsApi,
        {
            ...config,
            makeUrl,
            bluseskyPassowrd: c.env.JOSH412_BSKY
        }

    ));
    await next()
});
api.get("/status", (c) => c.json({ status: "ok",url:c.get('makeUrl')('/api/status') }));

//Run the scheduled function
api.get('/scheduled', async (c) => {
    const inestor = c.get('Injestor');
    try {
        await inestor.sync();
        return c.json({ status: "ok" });
    } catch (error) {
        return c.json({ status: "error", error: error.message },500);
    }
});

api.get('/status/accounts', (c) => {
    return c.json({
        accounts: config.social
    });
})
api.get('/status/db',

    async (c) => {
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

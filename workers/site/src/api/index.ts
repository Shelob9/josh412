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
import { fetchMedia } from "./util/fetchMedia";

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
            bluseskyPassword: c.env.JOSH412_BSKY
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

api.get('/status/media', async (c) => {
    await c.env.MEDIA_BUCKET.put('test.txt','test');
    //download the file
    const data = await c.env.MEDIA_BUCKET.get('test.txt');
    if(!data) return c.json({status:'download error'},500);
    const body = await data.text();
    return c.json({status:'ok',data:body});
});
const testUrl =  'https://files.mastodon.social/media_attachments/files/113/345/440/418/142/143/original/dfdbf3ba533cb6bb.png';
api.get('/status/media/fetch', async (c) => {
    try {
        const data = await fetchMedia(testUrl       );
        return c.json({status:'ok',data:data?.type});
    } catch (error) {
        return c.json({status:'fetch error',error:error.message},500);
    }
});

api.get('/status/media/upload', async (c) => {
    try {
        const data = await fetchMedia(testUrl        );
        if(! data) return c.json({status:'fetch error'},500);
        const saved = await c.env.MEDIA_BUCKET.put('test.png',data?.data);
        return c.json({status:'ok',data:data?.type,saved});
    } catch (error) {
        return c.json({status:'fetch error',error:error.message},500);

    }
});

api.get('/status/media/uploaded.png', async (c) => {
    const object = await c.env.MEDIA_BUCKET.get('test.png');
    if(!object) return c.json({status:'download error'},500);
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    return c.body(object.body, { headers });
});








api.route('/clippings', clippings);
api.route('/classifications', classifications );
api.route('/items', items);
api.route('/search', search);
export default api;

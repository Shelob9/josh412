import createClient from "@app/db";
import { Hono } from "hono";
import { Bindings, Variables } from "../../app.types";
import classifications from "./classifications";
import clippings from "./clippings";
import ClassificationsApi from "./database/Classifications";
import ClippingsApi from "./database/Clippings";
import ItemsApi from "./database/Items";
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

const validateSourceType = (type: string) :boolean=> {
    return ['bluesky','twitter', 'mastodon', 'wordpress'].includes(type);
}




api.get('/sources', async (c) => {
    const prisma = c.get('prisma');
    const page = c.req.query('page') as string || '1';
    const perPage = c.req.query('perPage') as string || '25';
    const sources = await prisma.source.findMany({
        skip: (parseInt(page,10)-1) * parseInt(perPage,10),
        take: parseInt(perPage,10)
    });
    return c.json({ sources });
});
api.get('/sources/:type', async (c) => {
    const prisma = c.get('prisma');
    const type = c.req.param('type');
    if( ! validateSourceType(type) ) {
        return c.json({ error: 'Invalid source type',type },400);
    }
    try {
        const sources = await prisma.source.findMany({ where: {
            type
         } });
        return c.json({ sources });
    } catch (error) {
        return c.json({ error },500);
    }
});

api.post('/sources', async (c) => {
    const prisma = c.get('prisma');
   try {

    const { type,url } = await c.req.json() as unknown as {
        type: string
        url: string
     };
     const exists = await prisma.source.findFirst({ where: {
        type,
        url
     } });
        if( exists ) {
            return c.json({ source: exists });
        }

     console.log({ type,url });
     if( ! validateSourceType(type) ) {
         return c.json({ error: 'Invalid source type',type },400);
     }

    const source = await prisma.source.create({ data: {
        type,
        url
     } });
    return c.json({ source });
   } catch (error) {
    return c.json({ error },500);
   }
});
api.post('/remoteAuthor', async (c) => {
    const prisma = c.get('prisma');
    const { remoteId,remoteHandle,remoteDisplayName,source } = c.body as unknown as {
        remoteId: string
        remoteHandle: string
        remoteDisplayName?: string | null
        source: string | {
            url: string,
            type: string
        }
     };
    if( ! source ) {
            return c.json({ error: 'Source is required' },400);
    }
    try {
        const sourceId = 'object' === typeof source ? await createOrFindSourceId(source.type,source.url) : source;
        try {
            const author = await prisma.remoteAuthor.create({ data: {
                remoteId,remoteHandle,remoteDisplayName,sourceId
             } });
            return c.json({ author });
        } catch (error) {
            return c.json({ error },500);

        }
    } catch (error) {
        return c.json({ error,source },500);
    }

});
api.put('/remoteAuthor', async (c) => {
    const prisma = c.get('prisma');
    const { remoteId,remoteHandle,remoteDisplayName,sourceId } = c.body as unknown as {
        remoteId: string
        remoteHandle: string
        remoteDisplayName?: string | null
        sourceId: string
     };
    const author = await prisma.remoteAuthor.update({ where: {
        sourceId_remoteId: {
            remoteId,
            sourceId
         }
     },data: {
        remoteHandle,
        remoteDisplayName
     } });
    return c.json({ author });
});
api.get('/remoteAuthors', async (c) => {
    const page = c.req.query('page') as string || '1';
    const perPage = c.req.query('perPage') as string || '25';
    const prisma = c.get('prisma');
    const authors = await prisma.remoteAuthor.findMany(
        {
            skip: (parseInt(page,10)-1) * parseInt(perPage,10),
            take: parseInt(perPage,10)
        }
    );
    return c.json({ authors });
});
api.get('/remoteAuthors/:sourceId', async (c) => {
    const prisma = c.get('prisma');
    const page = c.req.query('page') as string || '1';
    const perPage = c.req.query('perPage') as string || '25';
    const sourceId = c.req.param('sourceId');
    try {
        const authors = await prisma.remoteAuthor.findMany({
            where: {
                sourceId
            },
            skip: (parseInt(page,10)-1) * parseInt(perPage,10),
            take: parseInt(perPage,10)
        });
        return c.json({ authors });
    }catch(e) {
        return c.json({ error: e.message },500);
    }
});
api.get('/remoteAuthors/:sourceId/:remoteId', async (c) => {
    const prisma = c.get('prisma');

    const sourceId = c.req.param('sourceId');
    const remoteId = c.req.param('remoteId');
    try {
        const author = await prisma.remoteAuthor.findUnique({
            where: {
                sourceId_remoteId: {
                    remoteId,
                    sourceId
                }
         } });
        return c.json({ author });
    }catch(e) {
        return c.json({ error: e.message },500);
    }
});

api.route('/clippings', clippings);
api.route('/classifications', classifications );
//api.route('/items', items);
api.route('/search', search);
export default api;

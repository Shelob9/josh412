import { Hono } from "hono";
import { honoType } from "../../app.types";
import classifications from "./classifications";
import clippings from "./clippings";
import ClassificationsApi from "./database/Classifications";
import ClippingsApi from "./database/Clippings";
const api = new Hono<honoType>();
api.use("*", async (c, next) => {
    c.set('clippings', new ClippingsApi(c.env.DB));
    c.set('ClassificationsApi', new ClassificationsApi(c.env.DB));
    await next()
});
api.get("/status", (c) => c.json({ status: "ok" }));
api.get("/posts", async (c) => {
    const url = "https://jsonplaceholder.typicode.com/posts";
    const response = await fetch(url);
    const result: Data[] = await response.json();
    return c.json(result);
})
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


api.post('/classiy', async (c) => {
    const body = await c.req.json();
    if( ! body.classification) {
        return c.json({ err: "classification is required" });
    }
    if( ! body.source)  {
        return c.json({ err: "source is required" });
    }
    const uuid = crypto.randomUUID();
    try {
        const { lastInsertRowid } = await c.env.DB.prepare(
            "INSERT INTO classifications (uuid, classification, source) VALUES (?, ?, ?)",
        )
            .bind(uuid, body.classification, body.source)
            .run();
        return c.json({ lastInsertRowid,uuid });
    } catch (e) {
        return c.json({ err: e.message }, 500);
    }

});

api.get('/classifications', async (c) => {
    try {
        const { results } = await c.env.DB.prepare(
            "SELECT * FROM classifications",
        )
            .all();
        return c.json(results);
    } catch (e) {
        return c.json({ err: e.message }, 500);
    }
});

api.get('/classifications/:id', async (c) => {
    const uuid = c.req.param('id');
    console.log({uuid,req:c.req});
    try {
        const { results } = await c.env.DB.prepare(
            "SELECT * FROM classifications WHERE uuid = ?",
        )
            .bind(uuid)
            .all();
        if( ! results.length) {
            return c.json({ err: "Not found",uuid }, 404);
        }
        return c.json({ classification: results[0],uuid });
    } catch (e) {
        return c.json({ err: e.message, uuid}, 500);
    }
});

api.put('/classifications/:id', async (c) => {
    const uuid = c.req.param('id');

    try {
        const body = await c.req.json();
        const { changes } = await c.env.DB.prepare(
            "UPDATE classifications SET classification = ?, source = ? WHERE uuid = ?",
        )
            .bind(body.classification, body.source, uuid)
            .run();
        return c.json({ changes,uuid });
    } catch (e) {
        return c.json({ err: e.message }, 500);
    }
});

api.delete('/classifications/:id', async (c) => {
    const uuid = c.req.param('id');
    try {
        const { changes } = await c.env.DB.prepare(
            "DELETE FROM classifications WHERE uuid = ?",
        )
            .bind(uuid)
            .run();
        return c.json({ changes,uuid });
    } catch (e) {
        return c.json({ err: e.message }, 500);
    }
});
export default api;

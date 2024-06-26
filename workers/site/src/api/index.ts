import { Hono } from "hono";
import { honoType } from "../../app.types";

const api = new Hono<honoType>();
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
        return c.json({ tables });
     } catch (error) {
        return c.json({ error: error.message },500);

     }
});
api.get('/clippings', async (c) => {
   // return c.json({1:22})
    try {
        let { results } = await c.env.DB.prepare(
          "SELECT * FROM clippings",
        )
          .all();
        return c.json(results);
      } catch (e) {
        return c.json({ err: e.message }, 500);
      }

});
api.get('/clippings/:id', async (c) => {
    const uuid = c.req.param('uuid');
    console.log({uuid,1:1});
    try {
        const { results } = await c.env.DB.prepare(
            "SELECT * FROM clippings WHERE uuid = ?",
        )
            .bind(uuid)
            .all();
        if( ! results.length) {
            return c.json({ err: "Not found",uuid }, 404);
        }
        return c.json({ clipping: results[0],uuid });
    } catch (e) {
        return c.json({ err: e.message, uuid}, 500);
    }
});
api.post('/clippings', async (c) => {
    try {
        const body = await c.req.json();
        console.log({body});

        if(!body.domain || !body.path || !body.text) {
            return c.json({
                err: "domain, path, and text are required",
                body
            });
        }
        const uuid = crypto.randomUUID();
        console.log({uuid})
        const { lastInsertRowid } = await c.env.DB.prepare(
            "INSERT INTO clippings (uuid, domain, path, text) VALUES (?, ?, ?, ?)",
        )
            .bind(uuid,body.domain, body.path, body.text)
            .run();
        console.log({ lastInsertRowid });
        return c.json({ lastInsertRowid,uuid });
    } catch (e) {
        return c.json({ err: e.message }, 500);
    }
});

api.put('/clippings/:id', async (c) => {
    const uuid = c.req.param('id');

    try {
        const body = await c.req.json();
        const { changes } = await c.env.DB.prepare(
            "UPDATE clippings SET domain = ?, path = ?, text = ? WHERE uuid = ?",
        )
            .bind(body.domain, body.path, body.text, uuid)
            .run();
        return c.json({ changes,uuid });
    } catch (e) {
        return c.json({ err: e.message }, 500);
    }
});

api.delete('/clippings/:id', async (c) => {
    const uuid = c.req.param('id');
    try {
        const { changes } = await c.env.DB.prepare(
            "DELETE FROM clippings WHERE uuid = ?",
        )
            .bind(uuid)
            .run();
        return c.json({ changes,uuid });
    } catch (e) {
        return c.json({ err: e.message }, 500);
    }
});

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

import { Hono } from "hono";
import { honoType } from "../app.types";

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
        const { results } = await c.env.DB.prepare(
            "SELECT * FROM Customers WHERE CompanyName = ?"
          )
            .bind("Bs Beverages")
            .all();
        return c.json({ results});
     } catch (error) {
        return c.json({ error: error.message },500);

     }
});
export default api;

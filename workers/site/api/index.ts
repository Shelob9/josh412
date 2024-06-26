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
export default api;

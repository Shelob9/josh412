
  import { Hono } from "hono";
  export type Bindings = {
    __STATIC_CONTENT: KVNamespace;
    DB: D1Database;
  };

  export type honoType =  Hono<{ Bindings: Bindings }>;


  import { Hono } from "hono";
  export type Bindings = {
    __STATIC_CONTENT: KVNamespace;
  };

  export type honoType =  Hono<{ Bindings: Bindings }>;

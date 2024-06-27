
  import ClassificationsApi from "@app/api/database/Classifications";
import ClippingsApi from "@app/api/database/Clippings";
import { Hono } from "hono";
  export type Bindings = {
    __STATIC_CONTENT: KVNamespace;
    DB: D1Database;
  };
  export type Variables = {
    clippings: ClippingsApi;
    ClassificationsApi: ClassificationsApi
  }

  export type honoType =  Hono<{ Bindings: Bindings,Variables }>;

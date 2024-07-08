
  import ClassificationsApi from "@app/api/database/Classifications";
import ClippingsApi from "@app/api/database/Clippings";
import ItemsApi from "@app/api/database/Items";
import { Hono } from "hono";
  export type Bindings = {
    __STATIC_CONTENT: KVNamespace;
    DB: D1Database;
    JOSH412_BSKY: string;
  };
  export type Variables = {
    clippings: ClippingsApi;
    ClassificationsApi: ClassificationsApi
    ItemsApi: ItemsApi
  }

  export type honoType =  Hono<{ Bindings: Bindings,Variables:Variables }>;

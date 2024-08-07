
  import ClassificationsApi from "@app/api/database/Classifications";
import ClippingsApi from "@app/api/database/Clippings";
import ItemsApi from "@app/api/database/Items";
import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";
  export type Bindings = {
    __STATIC_CONTENT: KVNamespace;
    DB: D1Database;
    JOSH412_BSKY: string;
    KV: KVNamespace;
    TOKEN: string;
  };
  export type Variables = {
    clippings: ClippingsApi;
    classifications: ClassificationsApi
    ItemsApi: ItemsApi
    prisma: PrismaClient
  }

  export type honoType =  Hono<{ Bindings: Bindings,Variables:Variables }>;

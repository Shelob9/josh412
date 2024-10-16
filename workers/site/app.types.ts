
  import ClassificationsApi from "@app/api/database/Classifications";
import ClippingsApi from "@app/api/database/Clippings";
import InjestService from "@app/api/database/InjestService";
import ItemsApi from "@app/api/database/Items";
import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";
  export type Bindings = {
    __STATIC_CONTENT: KVNamespace;
    DB: D1Database;
    JOSH412_BSKY: string;
    KV: KVNamespace;
    TOKEN: string;
    MASTODON_TOKENS: string;
  };
  export type Variables = {
    clippings: ClippingsApi;
    classifications: ClassificationsApi
    ItemsApi: ItemsApi
    prisma: PrismaClient
    Injestor: InjestService
    makeUrl:(path:string,args?:{[key:string]:string|number|undefined}) => string

  }

  export type honoType =  Hono<{ Bindings: Bindings,Variables:Variables }>;

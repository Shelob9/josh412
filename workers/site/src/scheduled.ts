import createClient from "@app/db";
import config from "@lib/config";
import ClassificationsApi from "./api/database/Classifications";
import InjestService from "./api/database/InjestService";
import ItemsApi from "./api/database/Items";
const makeUrl = (path:string,args?:{[key:string]:string|number|undefined}) => {
    const requestUrl = new URL(c.req.url);
    const newUrl = new URL(`${requestUrl.protocol}//${requestUrl.host}${path}`);
    if(args){
        for (const key in args) {
            newUrl.searchParams.set(key, args[key]);
        }

    }
    return newUrl.toString();
}
export default async function scheduled(event: ScheduledEvent,env:{
DB: D1Database;
    JOSH412_BSKY: string;
    KV: KVNamespace;
    TOKEN: string;
    MASTODON_TOKENS: string;}) {
    console.log(`scheduled event ${JSON.stringify(event)}`);
    const prisma = createClient(env.DB);
    const classificationsApi = new ClassificationsApi(prisma);
    const itemsApi = new ItemsApi(prisma,env.KV);
    const injestor = new InjestService(classificationsApi,itemsApi,{
        ...config,
        makeUrl,
        bluseskyPassowrd: env.JOSH412_BSKY
    });
    try {
        await injestor.sync();
    } catch (error) {
       console.log({injestorSyncError: error});
    }
}

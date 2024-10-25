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
    MEDIA_BUCKET: R2Bucket;
    KV: KVNamespace;
    TOKEN: string;
    MASTODON_TOKENS: string;}) {
    console.log(`scheduled event ${JSON.stringify(event)}`);
    const prisma = createClient(env.DB);
    const classificationsApi = new ClassificationsApi(prisma,env.KV);
    const now = new Date();
    const todayString = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

    const itemsApi = new ItemsApi(prisma,env.KV);
    const savedCount = await env.KV.get(`injestorCreatedCount-${todayString}`);
    let createdCount: number = savedCount ? parseInt(savedCount) : 0;

    const injestor = new InjestService(
        classificationsApi,
        itemsApi,
        env.MEDIA_BUCKET,
        {
        ...config,
        makeUrl,
        bluseskyPassword: env.JOSH412_BSKY
    });
    try {
        try {
            const created = await injestor.sync();
            await env.KV.put(`injestorCreatedCount-${todayString}`, (createdCount + created).toString());
            const hasSyncedMediaToday = await env.KV.get(`hasSyncedMediaToday${todayString}`);
            if(!hasSyncedMediaToday){
                try {
                    await injestor.syncMedia();
                } catch (error) {
                    console.log({injestorSyncMediaError: true,error});
                }finally{
                    await env.KV.put(`hasSyncedMediaToday${todayString}`,'true');
                }
            }
        } catch (error) {
            console.log({injestorSyncError: error});
        }
    } catch (error) {
       console.log({injestorSyncError: error});
    }
}

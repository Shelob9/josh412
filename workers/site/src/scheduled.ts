import createClient from "@app/db";
import config from "@lib/config";
import ClassificationsApi from "./api/database/Classifications";
import InjestService from "./api/database/InjestService";
import ItemsApi, { Processed } from "./api/database/Items";
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
    const prisma = createClient(env.DB);
    const classificationsApi = new ClassificationsApi(prisma);
    const itemsApi = new ItemsApi(prisma,env.KV);
    const injestor = new InjestService(classificationsApi,itemsApi,{
        makeUrl
    });
    const maxTimesNoNewItems = 5;

    await Promise.all(config.social.mastodon.map(async ({
        accountId,
        instanceUrl,
        slug,

    }) => {
        let newItems : Processed[] = [];
        let ranOnce = false;
        let maxId :string|undefined = undefined;
        let timesNoNewItems = 0;
        //while ranOnce is false or maxId is not undefined
        while( ! ranOnce || maxId ){
            try {
                newItems = [];
                const returnValue = await injestor.injestMastodon({
                    accountId,
                    maxId,
                    instanceUrl,
                    slug: slug as 'mastodonSocial'|'fosstodon'
                });
                newItems = returnValue.items.filter( i => i.created);
                console.log({
                    newItems: newItems
                })
                if( newItems.length > 0){
                    await injestor.classifyItems(newItems,'mastodon');
                }else{
                    timesNoNewItems++;
                }
                if(returnValue.maxId){
                    maxId = returnValue.maxId;
                }else{
                    maxId = undefined;
                }
                ranOnce = true;
            } catch (error) {
                console.error({error});
                break;
            }
            if(timesNoNewItems > maxTimesNoNewItems){
                break;
            }
        }


    }))

    await Promise.all(config.social.bluesky.map(async ({
        did
    }) => {
        let timesNoNewItems = 0;

        let ranOnce = false;
        let newItems : Processed[] = [];
        let cursor :string|undefined = undefined;
        while( ! ranOnce || cursor ){
            try {
                newItems = [];
                const returnValue = await injestor.injestBlueSky({
                    did,
                    cursor,
                    bluesky: {
                        identifier: did,
                        password: env.JOSH412_BSKY,
                    }
                });
                //Classify
                newItems = returnValue.items.filter( i => i.created);
                console.log({
                    newItems: newItems
                })
                if( newItems.length > 0){
                    await injestor.classifyItems(newItems,'bluesky');
                }else{
                    timesNoNewItems++;
                }
                if(returnValue.cursor){
                    cursor = returnValue.cursor;
                }else{
                    cursor = undefined;
                }
                ranOnce = true;

            } catch (error) {
                console.error({error});
                break;
            }
            if(timesNoNewItems > maxTimesNoNewItems){
                break;
            }
        }


    }));
}

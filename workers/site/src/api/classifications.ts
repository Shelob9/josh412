import { Hono } from "hono";
import { honoType } from "../../app.types";
import { CLASSIFIERS } from "./classify/classifiers";
import { Classification_Source, classifySources } from "./classify/classify";
import ClassificationsApi from "./database/Classifications";
import ItemsApi from "./database/Items";

const api = new Hono<honoType>();

api.get('/classify', async (c) => {
    const route = 'GET /api/classify';
    const sources : Classification_Source[] = [
        {
            text: 'Good morning',
            sourcetype: 'text',
            id: '1'
        }
    ];
    const classified = await classifySources(sources,CLASSIFIERS);
    return c.json({ classified,route,sources });
});

api.post('/process', async (c) => {
    const itemsApi = c.get('ItemsApi') as ItemsApi;
    const classificationApi = c.get('ClassificationsApi') as ClassificationsApi;
    const body = await c.req.json() as unknown as {
        items: {
            content: string,
            remote_id: string
        } []
    }
    const item_type = 'mastodon_post'
    if( body.items ){
        const sources : Classification_Source[] = body.items.map(({content,remote_id}) => {
            return {
                text: content,
                sourcetype: item_type,
                id: remote_id
            }
        });
        const classifications = classifySources(sources,CLASSIFIERS);console.log({classifications})
        //return c.json({ route:'/api/process',sources,classifications });
        const processed = await Promise.all(Object.keys(classifications).map(async (source_id) => {
           const classification_ids = classifications[source_id];
           const source = sources.find(s => s.id === source_id)as Classification_Source;
           if( source ){
                const itemId = await itemsApi.create({
                    remote_id: source_id,
                    item_type,
                    content:source.text
                });
                classification_ids.forEach(async (classification_id) => {
                    await classificationApi.create({
                        item: itemId,
                        item_type,
                        classification: classification_id
                    });
                });
                return {
                    source_id,
                    item_id: itemId,
                    classification_ids
                }
           }


        }) );
        return c.json({ route:'/api/process',sources,processed });
    }else{
        return c.json({route:'/api/process',body});
    }

});

api.get('/byitem/:item', async (c) => {
    const route = 'GET /api/classifications/byitem/:item';
    const item = c.req.param('item');
    if( ! item) {
        return c.json({ err: "item is required",route });
    }
    const service = c.get('ClassificationsApi') as ClassificationsApi;
    try {
        const classifications = await service.byItem(item);
        return c.json({ classifications,route });
    } catch (e) {
        return c.json({ err: e.message,route }, 500);
    }

});
 api.get('/:uuid', async (c) => {
    const route = `GET /api/classifications/:uuid`
     const uuid = c.req.param('uuid');
     if( ! uuid) {
            return c.json({ err: "uuid is required",route });
        }
        const service = c.get('ClassificationsApi') as ClassificationsApi;
     try {
         const classification = await service.get(uuid);
         return c.json({ classification,uuid, route });
     } catch (e) {
         return c.json({ err: e.message, uuid,route}, 500);
     }
 });
 api.get('/', async (c) => {
    const route = 'GET /api/classifications';
    const service = c.get('ClassificationsApi') as ClassificationsApi;

    try {
        const classifications = await service.all({
            page: 1,
            perPage:25
        });
        return c.json({ classifications,route });
   } catch (e) {
     return c.json({ err: e.message,route }, 500);
   }

});



 api.delete('/:uuid', async (c) => {
    const route = 'DELETE /api/classifications/:uuid';
    const service = c.get('ClassificationsApi') as ClassificationsApi;
    const uuid = c.req.param('uuid');
    try {
        await service.delete(uuid);
        return c.json({ deleted:true,uuid,route });
    } catch (e) {
        return c.json({ deleted:false,err: e.message,route }, 500);
    }
});
 export default api;

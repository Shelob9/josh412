import { Hono } from "hono";
import { Bindings, Variables } from "../../app.types";
import ClassificationsApi, { Classification } from "./database/Classifications";
import InjestService from "./database/InjestService";
import ItemsApi from "./database/Items";
import { numberArg } from "./util/numberArg";
const api = new Hono<{Variables: Variables,Bindings:Bindings}>({ strict: false });

api.get('/', async (c) => {
    const classificationApi = c.get('classifications');
    const route = 'GET /api/classifications';
    const itemType = c.req.query('itemType') || undefined;
    const classifications = await classificationApi.all({
        page: numberArg(c.req,'page',1),
        perPage:numberArg(c.req,'perPage',25),
        itemType,
    });
    return c.json({ classifications,route, itemType});
});

api.get('/:itemType', async (c) => {
    const classificationApi = c.get('classifications');
    const itemType = c.req.param('itemType');
    const route = `GET /api/classifications/${itemType}`;
    const classifications = await classificationApi.all({
        page: numberArg(c.req,'page',1),
        perPage:numberArg(c.req,'perPage',25),
        itemType,
    });
    return c.json({ classifications,route, itemType});
})



api.post('/process/:source', async (c) => {
    const source = c.req.param('source');
    const route = `/api/process/${source}`;
    const itemsDb = c.get('ItemsApi') as ItemsApi;
    const injest = new InjestService(c.get('classifications'),itemsDb);
    const body : {
        page?: number,
        perPage?: number,
    } = await c.req.json();
    const page = body.page || 1;
    const perPage = body.perPage || 25;
    try {
        const {
            created,
            prepared,
            totalPages,
        } = await injest.classify(page,perPage,source);
        return c.json({ created, prepared, totalPages,route });
    } catch (error) {
        return c.json({ route, error:error.message });
    }



});

api.get('/byitem/:item', async (c) => {
    const route = 'GET /api/classifications/byitem/:item';
    const item = c.req.param('item');
    if( ! item) {
        return c.json({ err: "item is required",route });
    }
    const service = c.get('classifications') as ClassificationsApi;
    try {
        const classifications: Classification[] = [];
        return c.json({ classifications,route });
    } catch (e) {
        return c.json({ err: e.message,route }, 500);
    }

});




 api.delete('/:uuid', async (c) => {
    const route = 'DELETE /api/classifications/:uuid';
    const service = c.get('classifications') as ClassificationsApi;
    const uuid = c.req.param('uuid');
    try {
        await service.delete(uuid);
        return c.json({ deleted:true,uuid,route });
    } catch (e) {
        return c.json({ deleted:false,err: e.message,route }, 500);
    }
});


 export default api;

import { dataApi } from './dataApi';
import { KVNamespace } from 'edge-mock';

describe('dataApi', () => {
    let kv: KVNamespace;

    beforeEach(() => {
        kv = new KVNamespace();
    });

    test('storeItemInKV', async () => {
        const api = await dataApi({ kv });
        const sourceType = 'test';
        const data = { test: 'data' };
        const key = await api.storeItemInKV(sourceType, data);
        const storedData = await kv.get(key);
        expect(JSON.parse(storedData)).toEqual(data);
    });

    test('storeItemClassification', async () => {
        const api = await dataApi({ kv });
        const classificationKey = 'test';
        const itemKey = 'item';
        const classification = await api.storeItemClassification(classificationKey, itemKey);
        const storedClassification = await kv.get(classificationKey);
        expect(JSON.parse(storedClassification)).toEqual(classification);
    });

    test('getKeysOfItemsWithClassification', async () => {
        const api = await dataApi({ kv });
        const classificationKey = 'test';
        const itemKey = 'item';
        await api.storeItemClassification(classificationKey, itemKey);
        const keys = await api.getKeysOfItemsWithClassification(classificationKey);
        expect(keys).toContain(itemKey);
    });

    test('getItemsWithClassification', async () => {
        const api = await dataApi({ kv });
        const classificationKey = 'test';
        const sourceType = 'test';
        const data = { test: 'data' };
        const key = await api.storeItemInKV(sourceType, data);
        await api.storeItemClassification(classificationKey, key);
        const items = await api.getItemsWithClassification(classificationKey);
        expect(items).toContain(data);
    });

    test('storeItem', async () => {
        const api = await dataApi({ kv });
        const sourceType = 'test';
        const classificationKeys = ['test'];
        const data = { test: 'data' };
        const key = await api.storeItem(sourceType, classificationKeys, data);
        const storedData = await kv.get(key);
        expect(JSON.parse(storedData)).toEqual(data);
        const storedClassification = await kv.get(classificationKeys[0]);
        expect(JSON.parse(storedClassification)).toContain(key);
    });
test('storeItem with multiple classificationKeys', async () => {
    const api = await dataApi({ kv });
    const sourceType = 'test';
    const classificationKeys = ['test1', 'test2'];
    const data = { test: 'data' };
    const key = await api.storeItem(sourceType, classificationKeys, data);
    const storedData = await kv.get(key);
    expect(JSON.parse(storedData)).toEqual(data);
    for (let i = 0; i < classificationKeys.length; i++) {
        const storedClassification = await kv.get(classificationKeys[i]);
        expect(JSON.parse(storedClassification)).toContain(key);
    }
});

	

});

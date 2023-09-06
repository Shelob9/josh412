import {EdgeKVNamespace as KVNamespace} from 'edge-mock';
describe('edg-mock', () => {
    test('put and get kv', async() => {
        const kv = new KVNamespace();
        await kv.put('foo','bar');
        const value = await kv.get('foo');
        expect(value).toBe('bar');
    });
});

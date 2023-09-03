import { DrizzleD1Database, drizzle } from 'drizzle-orm/d1';
import { classifications, terms, taxonomies } from './db/schema';

type SourceType = string;

// make key for kv
const makeKey = (sourceType: SourceType, sourceid: string) => {
    return `${sourceType}:${sourceid}`;
}

async function dataapi({
    db,
    kv,
}: {
    db: D1Database,
    kv: KVNamespace,
}) {

  // store one item in KV
    async function storeItemInKV(sourceType: SourceType, data: any) {
        const key = makeKey(sourceType, data.id);
        await kv.put(key, JSON.stringify(data));
    }

    return {
        storeItemInKV,
    }
}

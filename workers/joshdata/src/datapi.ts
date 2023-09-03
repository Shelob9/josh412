import { DrizzleD1Database, drizzle } from 'drizzle-orm/d1';
import { classifications, terms, taxonomies } from './db/schema';

type SourceType = string;
// make a unique ID
function generateUid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

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
       return key;
		}

	// get a taxonomy, creating if needed
	async function getTx(taxonomy: string) {
      let taxonomyItem = await drizzle(taxonomies).findOne({ slug: taxonomy });
        
        if (!taxonomyItem) {
            const taxonomyId = generateUid();
            await drizzle(taxonomies).insert({ id: taxonomyId, slug: taxonomy });
            taxonomyItem = await drizzle(taxonomies).findOne({ slug: taxonomy });
				} 
            return taxonomyItem;
				
	}

    async function storeItem(sourceType: SourceType, taxonomy: string, terms: string[], data: any) {
        const taxonomyItem = await getTx(taxonomy);
        
       const key = await storeItemInKV(sourceType, data);
    }

    return {
        storeItemInKV,
        storeItem,
    }
}

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
const makeKey = (sourceType: SourceType) => {
    const uid = generateUid();
    return `${sourceType}:${uid}`;
}

async function dataapi({
    db,
    kv,
}: {
    db: D1Database,
    kv: KVNamespace,
}) {

    // store one item in KV
    async function storeItemInKV(sourceType: SourceType, data: any, key?: string) {
        if (!key) {
            key = makeKey(sourceType);
        }
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

    // get a term, creating if needed
    async function getTerm(term: string) {
        let termItem = await drizzle(terms).findOne({ slug: term });
        
        if (!termItem) {
            const termId = generateUid();
            await drizzle(terms).insert({ id: termId, slug: term });
            termItem = await drizzle(terms).findOne({ slug: term });
        } 
        return termItem;
    }

	async function storeTermClassification(
		classId: number,
		taxonomyItem :{id: number},
		termItem: {id: number},
		kvKey: string,
		sourceType:SourceType,
	){
 
		

		const args = { 
								 taxonomy: taxonomyItem.id,
								 term: termItem.id, 
								 sourceType, 
								 sourceId: kvKey
				};
			await drizzle(classifications)
				.insert(args);
		const classification = await drizzle(classifications)
		 .findOne(args);
			 
      return classification;
				
	}

    async function storeItem(sourceType: SourceType, taxonomy: string, terms: string[], data: any, key?: string) {
        const taxonomyItem = await getTx(taxonomy);
        
        const kvKey = await storeItemInKV(sourceType, data, key);

			for (const term of txTerms) {
				  const termItem = getTerm(term);
            
                await storeTermClassification(
                  taxonomyItem,
									termItem,
									kvKey,
									sourceType
								);
						
			}
        
    }

    return {
        storeItemInKV,
        storeItem,
        getTerm,
        getTx,
    }
}

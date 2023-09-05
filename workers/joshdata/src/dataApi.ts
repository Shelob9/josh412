


type SourceType = string;

// make a unique ID
function generateUid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// make key for kv
const makeKey = (sourceType: SourceType, uid? : string) => {
    uid = uid ?? generateUid();
    return `${sourceType}:${uid}`;
}
export async function dataApi({
    kv,
}: {
    kv: KVNamespace,
}) {

    // store one item in KV
    async function storeItemInKV(sourceType: SourceType, data: any, key?: string) {
        if( ! key ){
            key = makeKey(sourceType);
        }
        await kv.put(key, JSON.stringify(data));
        return key;
    }



    //Store classification for item
    async function storeItemClassification(classificationKey: string, itemKey: string): Promise<string[]> {
        const saved = await kv.get(classificationKey);
        const classification : string[] = saved ? JSON.parse(saved) : [];
        if( ! classification.includes(itemKey) ){
            classification.push(itemKey);
            await kv.put(classificationKey, JSON.stringify(classification));
        }
        return classification;
    }

    //Remove classification for item
    async function removeItemClassification(classificationKey: string, itemKey: string): Promise<string[]> {
        const saved = await kv.get(classificationKey);
        const classification : string[] = saved ? JSON.parse(saved) : [];
        if( classification.includes(itemKey) ){
            classification.splice(classification.indexOf(itemKey),1);
            await kv.put(classificationKey, JSON.stringify(classification));
        }
        return classification;
    }

    // get keys opf items with classification
    async function getKeysOfItemsWithClassification(classificationKey: string): Promise<string[]> {
        const keys = await kv.get(classificationKey);
        return keys ? JSON.parse(keys) : [];

    }

    //get all items with classification
    async function getItemsWithClassification(classificationKey: string): Promise<any[]> {
        const keys = await getKeysOfItemsWithClassification(classificationKey);
        const items = await Promise.all(
            keys.map(
                async (key: string) => {
                    const data = await kv.get(key);
                    if( data ){
                        return JSON.parse(data);
                    }
                    return null;
                }
            )
            //remove nulls
            .filter(item => item)
        );
        return items;
    }



    async function storeItem(sourceType: SourceType,classificationKeys: string[], data: any, key?: string) {
        const kvKey = await storeItemInKV(sourceType, data, key);

        if( classificationKeys.length > 0 ){
            await Promise.all(
                classificationKeys.map(
                    async (classificationKey: string) => {
                        await storeItemClassification(classificationKey, kvKey);
                    })
            );
        }
        return kvKey;

    }

    return {
        storeItem,
        getItemsWithClassification,
        getKeysOfItemsWithClassification,
        storeItemClassification,
    }
}

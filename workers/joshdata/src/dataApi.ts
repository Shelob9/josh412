


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

    // get a taxonomy, creating if needed
    async function getTx(taxonomy: string) {



    }

    // get a term, creating if needed
    async function getTerm(term: string) {

    }

	async function storeTermClassification(
	){





	}

    async function storeItem(sourceType: SourceType, taxonomy: string, terms: string[], data: any, key?: string) {
        const taxonomyItem = await getTx(taxonomy);

        const kvKey = await storeItemInKV(sourceType, data, key);


    }

    return {
        storeItem,
        getTerm,
        getTx,
    }
}

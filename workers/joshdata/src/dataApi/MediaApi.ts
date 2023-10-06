import { DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import { Env } from "src/env";
import { ImageAttachment } from "@social";
import { putMediaItem } from "@media/functions";
import { INSERT_IMAGE, TABLE_media } from "src/db/schema";

export default class MediaApi {
    kv: KVNamespace;
    d1: DrizzleD1Database;
    BUCKET: R2Bucket;
    constructor(kv: KVNamespace, d1: DrizzleD1Database, BUCKET: R2Bucket) {
        this.kv = kv;
        this.d1 = d1;
        this.BUCKET = BUCKET;
    }

    async putAttatchment(item: ImageAttachment) {
        const newKey = this.makeCdnKey(item);
        const response = await fetch(item.url);
        if (response.ok && response.body) {

            await putMediaItem(this.BUCKET, newKey, response.body);
        }

        await this.d1.insert(TABLE_media).values(
            this.attatchmentToInsert(item)
        ).execute();

    }

    attatchmentToInsert(item: ImageAttachment): INSERT_IMAGE {
        const extension = item.url.split('.').pop();
        return {
            url: item.url,
            height: item.meta?.original.height ?? 0,
            width: item.meta?.original.width ?? 0,
            cdnurl: this.makeCdnUrl(item),
            //@todo this based on actual type.
            mimetype: `image/${extension}`,
            description: item.description,
        }
    }

    makeCdnUrl(item: ImageAttachment): string {
        const name = item.url.split('/').pop();
        return `https://josh412/${this.makeCdnKey(item)}`;
    }

    makeCdnKey(item: ImageAttachment): string {
        const name = item.url.split('/').pop();
        return `photos/${name}`;
    }

}

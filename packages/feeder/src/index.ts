import DataService from "./data/DataServiceProvider";
import ScheduledPostData, {
    Account,
    InsertScheduledPost,
    ScheduledPost,
} from "./data/ScheduledPostData";
import * as dbSchema from "./db/schemas";
export interface Env {
    QSTASH_CURRENT_SIGNING_KEY: string;
    QSTASH_NEXT_SIGNING_KEY: string;
    QSTASH_TOKEN: string;
    UPSTASH_QSTASH_URL: string;
    IMAGE_BUCKET: R2Bucket;
    KV: KVNamespace;
    DB: D1Database;
}

export {
    Account, DataService, InsertScheduledPost, ScheduledPost, ScheduledPostData, dbSchema
};

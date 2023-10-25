import DataService from "./data/DataServiceProvider";
import ScheduledPostData from "./data/ScheduledPostData";
export interface Env {
    QSTASH_CURRENT_SIGNING_KEY: string;
    QSTASH_NEXT_SIGNING_KEY: string;
    QSTASH_TOKEN: string;
    UPSTASH_QSTASH_URL: string;
    IMAGE_BUCKET: R2Bucket;
    KV: KVNamespace;
}

export {
    DataService,
    ScheduledPostData
};

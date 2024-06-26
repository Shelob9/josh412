export interface Env {
	KV: KVNamespace;
	DB1: D1Database,
	DATABUCKET: R2Bucket;
	CDN_BUCKET: R2Bucket;
	INJEST_QUEUE: Queue;
	SECRET_TOKEN: string;
}

export const getMediaItem = async (BUCKET: R2Bucket, key: string): Promise<R2ObjectBody|false> => {
    const object = await BUCKET.get(key);
    if (object === null) {
      return false;
    }
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    return object
}

export async function putMediaItem(BUCKET: R2Bucket, key: string, data: ReadableStream<any> ): Promise<{
    message: string;
    key: string;
    created: boolean;
  }> {
    try {
      const created = await BUCKET.put(key, data);
      return {
        message: 'Created',
        key,
        created: created ? true : false,
      }
    } catch (error) {
      return {
        message: "failed to create",
        key,
        created: false,
      };
    }
  }

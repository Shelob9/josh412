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

export async function putMediaItem(BUCKET: R2Bucket, key: string, data: ReadableStream<any>,httpMetadata?: R2HTTPMetadata | Headers,
  customMetadata?: Record<string, string> ): Promise<{
    message: string;
    key: string;
    created: boolean;
  }> {
    let options = undefined;
    if( customMetadata &&httpMetadata ){
      options = {
        httpMetadata,
        customMetadata,
      }
    }else if ( httpMetadata ){
      options = {
        httpMetadata,
      }
    }else if ( customMetadata ){
      options = {
        customMetadata,
      }
    }
    try {
      const created = await BUCKET.put(key, data, options);
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

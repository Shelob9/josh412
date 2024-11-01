export const getMediaItem = async (BUCKET: R2Bucket, key: string): Promise<{
    body:R2ObjectBody
    headers: Headers
}> => {
    const object = await BUCKET.get(key);
    if (object === null) {
      throw new Error('Not Found');
    }
    const headers = new Headers();
    headers.set("etag", object.httpEtag);
    if(object.httpMetadata?.cacheControl){
        headers.set("cache-control", object.httpMetadata?.cacheControl);
    }
    if(object.httpMetadata?.contentDisposition){
        headers.set("content-disposition", object.httpMetadata?.contentDisposition);
    }
    if(object.httpMetadata?.contentEncoding){
        headers.set("content-encoding", object.httpMetadata?.contentEncoding);
    }
    if(object.httpMetadata?.contentLanguage){
        headers.set("content-language", object.httpMetadata?.contentLanguage);
    }
    if(object.httpMetadata?.contentType){
        headers.set("content-type", object.httpMetadata?.contentType);
    }else{
        headers.set("content-type", contentTypeFromKey(key));
    }
    headers.set("x-josh412", 'x1');


    return {body:object,headers }
}

export async function putMediaItem(
    BUCKET: R2Bucket, key: string,
    data: ReadableStream<any>|Uint8Array,
    httpMetadata?: R2HTTPMetadata,
    customMetadata?: Record<string, string>
 ): Promise<{
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
    if(! options ){
        options = {
            httpMetadata: {
                contentType: contentTypeFromKey(key),
            },
        }
    }else if  (! options.httpMetadata){
        options.httpMetadata = {
            contentType: contentTypeFromKey(key),
        };
    }else{
        options.httpMetadata = {
            ...options.httpMetadata,
            contentType: contentTypeFromKey(key),
        };
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


  export function contentTypeFromKey(key:string){
    const ext = key.split('.').pop();
    switch(ext){
        case 'txt':
            return 'text/plain';
        case 'html':
            return 'text/html';
        case 'css':
            return 'text/css';
        case 'js':
            return 'text/javascript';
        case 'json':
            return 'application/json';
        case 'xml':
            return 'application/xml';
        case 'png':
            return 'image/png';
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'gif':
            return 'image/gif';
        case 'webp':
            return 'image/webp';
        case 'svg':
            return 'image/svg+xml';
        case 'pdf':
            return 'application/pdf';
        case 'mp4':
            return 'video/mp4';
        case 'webm':
            return 'video/webm';
        case 'ogg':
            return 'video/ogg';
        default:
            return 'application/octet-stream';
    }
  }

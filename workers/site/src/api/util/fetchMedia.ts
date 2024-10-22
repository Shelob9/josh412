
/**
 * Fetch media as blob
 *
 * Based on: https://github.com/skyware-js/bot/blob/3237ddadf5b56f4cb5903843e1bc599028585cc2/src/struct/post/embed/util.ts#L125-L139
 */
export async function fetchMedia(
	url: string,
	mimeTypePrefix?: string,
    timeoutTime?: number,
): Promise<{ type: string; data: Uint8Array } | null> {
    mimeTypePrefix = mimeTypePrefix || "image/";
    timeoutTime = timeoutTime || 5000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutTime);
    const res = await fetch(url, {
        signal: controller.signal,
    });
    if (!res || !res.ok) {
        return null;
    }

    const blob = await res.blob()
    if (!blob){
        return null;
    }

    const type = res.headers.get("content-type");
    if (!type?.startsWith(mimeTypePrefix)){
        return null;
    }
    clearTimeout(timeoutId);

    return { type, data: new Uint8Array(await blob.arrayBuffer()) };


}

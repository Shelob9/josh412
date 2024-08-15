import { withWorkerName } from '@lib/ResponseFactory';
const workerName = 'wp-star';
const config = {
	uri: 'https://josh412.com'
}
function makeHeaders(httpMetadata: R2HTTPMetadata): Headers {
	const headers = new Headers();

	if (httpMetadata.contentEncoding) {
	  headers.set('Content-Encoding', httpMetadata.contentEncoding);
	}
	if (httpMetadata.contentType) {
	  headers.set('Content-Type', httpMetadata.contentType);
	}
	if (httpMetadata.contentLanguage) {
	  headers.set('Content-Language', httpMetadata.contentLanguage);
	}
	if (httpMetadata.contentDisposition) {
	  headers.set('Content-Disposition', httpMetadata.contentDisposition);
	}
	if (httpMetadata.cacheControl) {
	  headers.set('Cache-Control', httpMetadata.cacheControl);
	}else{
		headers.set('Cache-Control', 'public, max-age=604800, immutable');
	}
	if (httpMetadata.cacheExpiry) {
	  headers.set('Expires', httpMetadata.cacheExpiry.toUTCString());
	}

	return headers;
  }
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		//If not GET, return unmodified request
		if (request.method !== 'GET') {
			return fetch(request)
		}
		//if it's from /wp-content/plugins/garden-source/build/
		//get from BUCKET
		if( request.url.replace(config.uri,'').startsWith('/wp-content/plugins/garden-source/build/') ){

			//get from BUCKET
			const bucket = env.BUCKET;
			const url = request.url.replace(config.uri,'');
			// if has ? remove it
			let key = url.indexOf('?') > -1 ? url.split('?')[0] : url;
			if( '/' === key.charAt(0) ){
				key = key.substring(1);
			}
			console.log({key,url});

			const obj = await bucket.get(key);
			if( null === obj ){
				console.log({obj})
				return new Response(`${key} Not found`, {status: 404})
			}
			const metaData = await bucket.head(key);
			if( ! metaData ){
				return new Response(`${key} Not found at metaData`, {status: 404})
			}
			const body = await obj.text();
			const headers = makeHeaders(metaData.httpMetadata ?? {})
			console.log({metaData,headers});
			return withWorkerName( {
				response: new Response(body, {
					status: 200,
					statusText: 'OK',
					headers: makeHeaders(metaData.httpMetadata ?? {})
				}),
				workerName
			})
		}

		// Instantiate new URL to make it mutable
		const originalUrl = new URL(request.url)
		const newUrl = new URL(`${config.uri}${originalUrl.pathname}${originalUrl.search}`)
		const queryCacheKey = `${originalUrl.hostname}${originalUrl.pathname}${originalUrl.search}`

		// Different asset types usually have different caching strategies. Most of the time media content such as audio, videos and images that are not user-generated content would not need to be updated often so a long TTL would be best. However, with HLS streaming, manifest files usually are set with short TTLs so that playback will not be affected, as this files contain the data that the player would need. By setting each caching strategy for categories of asset types in an object within an array, you can solve complex needs when it comes to media content for your application

		const cacheAssets = [
			{asset: 'image', key: queryCacheKey, regex: /(.*\/Images)|(.*\.(jpg|jpeg|png|bmp|pict|tif|tiff|webp|gif|heif|exif|bat|bpg|ppm|pgn|pbm|pnm))/, info: 0, ok: 3600, redirects: 30, clientError: 10, serverError: 0 },
			{asset: 'frontEnd', key: queryCacheKey, regex: /^.*\.(css|js)/, info: 0, ok: 3600, redirects: 30, clientError: 10, serverError: 0 },
		];
		const { asset, regex, ...cache } = cacheAssets.find( ({regex}) => originalUrl.pathname.match(regex)) ?? {}
		const cacheKey = cache ? cache.key : queryCacheKey;//@ts-ignore
		console.log({
			cache,
			newUrl,
			cacheKey,
			url:request.url,
			r: request.url.replace(config.uri,''),
		})
		const newResponse = await fetch(newUrl,
				{ cf:
					{
						cacheKey,
						polish: false,
						cacheEverything: true,
						cacheTtlByStatus: {
							'100-199': cache.info,
							'200-299': cache.ok,
							'300-399': cache.redirects,
							'400-499': cache.clientError,
							'500-599': cache.serverError
							},
						cacheTags: [
							'static'
						]
					},

				})

		const response = new Response(newResponse.body, newResponse)
		ctx.waitUntil(
			caches.default.put(request, response.clone())
		);
		return withWorkerName( {
			response,
			workerName
		})
	},
};

import config from '@lib/config';
import { withWorkerName } from '@lib/ResponseFactory';
const workerName = 'wp-star';
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
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

		const newResponse = await fetch(newUrl,
				{ cf:
					{
						cacheKey: cache ? cache.key : queryCacheKey,
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
				console.log(cache);

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

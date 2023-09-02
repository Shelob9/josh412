class AttributeRewriter {
	attributeName: string;
	oldUrl: string;
	newUrl: string;
	constructor(attributeName:string, oldUrl:string, newUrl:string) {
		this.oldUrl = oldUrl;
		this.newUrl = newUrl;
	  	this.attributeName = attributeName;
	}
	element(element: Element) {
		const attribute = element.getAttribute(this.attributeName);
		if (attribute) {
			element.setAttribute(
				this.attributeName,
				attribute.replace(
					this.oldUrl,
					this.newUrl
				)
			);
		}
	}
  }


const NEW_URL = 'https://josh412.com';
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const {BUCKET} = env;
		const url = new URL(request.url);
		const path = url.pathname;
		const exits = await BUCKET.get(path);
		if (exits) {
			const object = await BUCKET.get(path);

			if (object === null) {
			  return new Response('Object Not Found', { status: 404 });
			}

			const headers = new Headers();
			object.writeHttpMetadata(headers);
			headers.set('etag', object.httpEtag);

			return new Response(object.body, {
			  headers,
			});
		}
		const proxyUrl = 'https://cms.josh412.com';
		// make subrequests with the global `fetch()` function
		let res = await fetch(`${proxyUrl}${path}`, request);

		res = new HTMLRewriter().on('a', new AttributeRewriter(
			'href',
			proxyUrl,
			NEW_URL
		)).transform(res);
		res = new HTMLRewriter().on('img', new AttributeRewriter(
			'src',
			proxyUrl,
			NEW_URL
		)).transform(res);

		await BUCKET.put(path,res);

		return res;
	},
};

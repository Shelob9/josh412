import { Env } from "../env";
export type handlerInputArgs = {
	env: Env,
	req: Request,
}

export const createHandler = async (
	env: Env,
	req: Request,
	fn: (env: Env, url: URL, request: Request) =>  Promise<Response>
) => {
	const url = new URL(req.url);
	return await fn(env,url,req);
}

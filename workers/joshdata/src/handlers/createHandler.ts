import { DataService } from "../dataApi";
import { Env } from "../env";
export type handlerInputArgs = {
	env: Env,
	req: Request,
}

export const createHandler = async (
	env: Env,
	req: Request,
	fn: (data: DataService, url: URL, request: Request) =>  Promise<Response>
) => {
	const data = new DataService(env);
	const url = new URL(req.url);
	return await fn(data,url,req);
}

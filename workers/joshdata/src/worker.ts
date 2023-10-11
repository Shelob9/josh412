

import { Env } from './env';

import fetchRouter from './router'
import { Injest_Message } from './types';
import { InjestQueueApi } from './dataApi/InjestApi';
import { DataService } from './dataApi';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return fetchRouter.handle(request, env, ctx)
	},
	async queue(batch: MessageBatch<Injest_Message>, env: Env): Promise<void> {
		const injestQueue = new InjestQueueApi(new DataService(env));
		for (const message of batch.messages) {
			await injestQueue.consume(message.body as Injest_Message);
		}
	},
};

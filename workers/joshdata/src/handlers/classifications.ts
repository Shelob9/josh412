import { jsonReponse } from "src/responseFactory";
import { createHandler, handlerInputArgs } from "./createHandler";

export const allClassifications = async ({env,req}: handlerInputArgs): Promise<Response> => {
    return createHandler(env,req,async (data,url,req) => {
        const dataApi = await data.getStatusApi('mastodon');
        const classifications = await dataApi.getClassifications();
        return jsonReponse({
            classifications,
        },200);

    });
}

//get classifications for a status

import {handleGet} from "@media/handlers"

interface Env {
  BUCKET: R2Bucket;
}



const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { BUCKET } = env;
    const response = await handleGet(request, BUCKET);
    return response;

  }

};

export default worker;

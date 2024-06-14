export const withWorkerName = ({response,workerName}:{
    response: Response,
    workerName: string
}) => {
    response.headers.set('x-worker', workerName);
    return response;
}

export const returnJson = ({
    data,
    workerName,
    status = 200,
}:{
    data: any,
    workerName: string,
    status?: number
}) => {
    return withWorkerName({
        response: new Response(JSON.stringify(data), {
            status,
            headers: {

                'content-type': 'application/json',
            },
        }),
        workerName
    });

}

export default class ResponseFactory {
    response: Response;
    constructor(response: Response) {
        this.response = response;
    }

    withWorkerName(workerName: string) {
        return withWorkerName({
            response: this.response,
            workerName
        });
    }

}

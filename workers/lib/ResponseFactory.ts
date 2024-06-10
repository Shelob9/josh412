export const withWorkerName = ({response,workerName}:{
    response: Response,
    workerName: string
}) => {
    response.headers.set('x-worker', workerName);
    return response;
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

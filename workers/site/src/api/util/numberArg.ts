import { HonoRequest } from "hono";

export const numberArg = (req:HonoRequest,key:string,defaultValue?:number) => {
    if( ! req.query(key)){
        if(defaultValue){
            return defaultValue;
        }
        return undefined;
    }
    return parseInt(req.query(key) as string) || defaultValue;
}

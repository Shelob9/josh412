import { Env } from "..";
import ScheduledPostData from "./ScheduledPostData";

export default class DataService {
    env: Env;
    constructor(env: Env) {
        this.env = env;
    }

    get kv(){
        return this.env.KV;
    }

    getSchedulePostApi(){
        return new ScheduledPostData(this);
    }
}

import { Env } from "..";
import AccountsService from "./Accounts";
import ScheduledPostData from "./ScheduledPostData";
export default class DataServiceProvider {
    env: Env;
    constructor(env: Env) {
        this.env = env;
    }

    get kv(){
        return this.env.KV;
    }

    get scheduledPosts(){
        return new ScheduledPostData(this);
    }

    get accounts(){
        return new AccountsService(this);
    }
}

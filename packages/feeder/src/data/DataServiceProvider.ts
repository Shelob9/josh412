import { Env } from "..";
import AccountsService from "./Accounts";
import ScheduledPostData from "./ScheduledPostData";
export default class DataServiceProvider {
    env: Env;
    private _scheduledPosts: ScheduledPostData;
    private _accounts: AccountsService;
    constructor(env: Env) {
        this.env = env;
    }

    get kv(){
        return this.env.KV;
    }

    get scheduledPosts(){
        if( ! this._scheduledPosts ){
            this._scheduledPosts = new ScheduledPostData(this);
        }
        return this._scheduledPosts;
    }

    get accounts(){
        if( ! this._accounts ){
            this._accounts = new AccountsService(this);
        }
        return this._accounts;
    }
}

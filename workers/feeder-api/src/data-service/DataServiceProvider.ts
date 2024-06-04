import { DrizzleD1Database, drizzle } from 'drizzle-orm/d1';
import { Env } from "..";
import { TABLE_FEEDER_ACCOUNTS } from '../db/schemas';
import AccountsService, { IAccounts } from "./Accounts";
import AccountsKv from './AccountsKv';
import ScheduledPostData, { IPostsService } from "./ScheduledPostData";
import ScheduledPostKv from './ScheduledPostKv';

export default class DataServiceProvider {
    env: Env;
    private _scheduledPosts: IPostsService;
    private _accounts: IAccounts;
    private dbInstance : DrizzleD1Database;
    private kvMode : boolean = true;
    constructor(env: Env) {
        this.env = env;
    }


    get kv(){
        return this.env.KV;
    }


    get scheduledPosts(){
        if( ! this._scheduledPosts ){
            if( ! this.kvMode ){
                this._scheduledPosts = new ScheduledPostData(this);
            }else{
                this._scheduledPosts = new ScheduledPostKv(this);
            }
        }
        return this._scheduledPosts;
    }

    get accounts(): IAccounts{
        if( ! this._accounts ){
            if( ! this.kvMode ){
                  this._accounts = new AccountsService(this);


            }else{
                this._accounts = new AccountsKv(this);
            }
        }
        return this._accounts;
    }

    async counts(){
        const db = this.db;
        const accounts = await db.select().from(TABLE_FEEDER_ACCOUNTS).all();

        return {
            accounts: accounts.length,
        };
    }

    protected get db(){
        if( ! this.dbInstance ){
            this.dbInstance = drizzle(this.env.DB);
        }
        return this.dbInstance;

    }
}

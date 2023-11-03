import { DrizzleD1Database, drizzle } from 'drizzle-orm/d1';
import { v4 as uuid } from 'uuid';

import DataServiceProvider from "./DataServiceProvider";
import { Account } from "./ScheduledPostData";
export default abstract class DataService{
    private dataService: DataServiceProvider;
    private dbInstance:DrizzleD1Database;
    constructor(data: DataServiceProvider) {
        this.dataService = data;
    }
    protected get kv(){
        return this.dataService.kv;
    }

    protected uuid(){
        return uuid();
    }

    protected get db(){
        if( ! this.dbInstance ){
            this.dbInstance = drizzle(this.dataService.env.DB);
        }
        return this.dbInstance;

    }

    protected get accounts(){
        return this.dataService.accounts;
    }

    //should be accountKeyForPost
    accountKey(account: Account) {
        return `Sp_${account.network}:${account.instanceUrl}:A_${account.accountId}`
    }

    scheduledPostKey(postAt: Date, account: Account | string ) {
        console.log({postAt})
        const accountKey = 'string' === typeof account ? account : this.accountKey(account);
        //postAt in year month day hour minute as a string
        const at = `${postAt.getFullYear()}${postAt.getMonth()}${postAt.getDate()}${postAt.getHours()}${postAt.getMinutes()}`
        return `${accountKey}:at_${at}`;
    }
}

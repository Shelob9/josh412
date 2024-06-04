import { eq } from "drizzle-orm";
import { FEEDER_ALLOWED_NETWORK, INSERT_FEEDER_ACCOUNT, TABLE_FEEDER_ACCOUNTS } from "../db/schemas";
import DataService from "./DataService";
import DataServiceProvider from "./DataServiceProvider";
import { Account } from "./ScheduledPostData";

export interface IAccounts {
    saveAccount(account: Account): Promise<string | false>;
    createAccount(account: INSERT_FEEDER_ACCOUNT): Promise<string | false>;
    getAccounts(network: FEEDER_ALLOWED_NETWORK | undefined): Promise<Account[]>;
    getAccount(accountKey: string): Promise<Account>;
    deleteAccount(accountKey: string): Promise<void>;
    hasAccount(accountKey: string): Promise<boolean>;
    getAccountToken(accountKey: string): Promise<string>;
    saveAccountToken(accountKey: string, token: string): Promise<void>;
}



export default class Accounts extends DataService implements IAccounts {
    constructor(data: DataServiceProvider){
        super(data);
    }

    async saveAccount( account : Account ){

        try {
            await this.db.insert(TABLE_FEEDER_ACCOUNTS).values({...account});
            return account.accountKey;
        } catch (error) {
            console.log(error);
            return false;
        }

    }
    async createAccount( account : INSERT_FEEDER_ACCOUNT ){
        const accountKey = `A_{${this.uuid()}}`
        console.log({...account,accountKey});
        try {
            await this.db.insert(TABLE_FEEDER_ACCOUNTS).values({...account,accountKey});
            return accountKey;
        } catch (error) {
            console.log(error);
            return false;
        }
        return false;

    }

    async getAccounts(network:FEEDER_ALLOWED_NETWORK|undefined ){
        if( network === undefined ){
            const r = await this.db.select().from(TABLE_FEEDER_ACCOUNTS).all();
            return r as Account[];
        }
        const r = await this.db.select().from(TABLE_FEEDER_ACCOUNTS).where(
            eq(TABLE_FEEDER_ACCOUNTS.network, network)
        ).all();
        return r as Account[];
    }

    async getAccount( accountKey : string ):Promise<Account>{
        const r = await this.db.select().from(TABLE_FEEDER_ACCOUNTS).where(
            eq(TABLE_FEEDER_ACCOUNTS.accountKey, accountKey)
        ).all();
        if( r.length ){
            return r[0] as Account;
        }

    }

    async deleteAccount( accountKey : string ){
        await this.db.delete(TABLE_FEEDER_ACCOUNTS).where(eq(
            TABLE_FEEDER_ACCOUNTS.accountKey,
            accountKey
        )).execute();
    }

    async hasAccount(accountKey :string ){
        const account = await this.getAccount(accountKey);
        return account !== undefined;
    }

    async getAccountToken( accountKey:string ){
        const exists = await this.hasAccount(accountKey);
        if(!exists){
            throw new Error("Account not found");
        }

        const token = await this.kv.get(this.tokenKey(accountKey));
        if( token ){
            return token;
        }
        throw new Error("Token not found");
    }

    async saveAccountToken( accountKey: string, token : string ){
        const exists = await this.hasAccount(accountKey);
        if(!exists){
            throw new Error("Account not found");
        }
        return await this.kv.put(this.tokenKey(accountKey), token);
    }

    private tokenKey(account: Account|string){
        if( "string" === typeof account ){
            return `${account}:token`;
        }
        return `${this.accountKey(account)}:token`;
    }
}

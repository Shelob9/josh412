import DataService from "./DataService";
import DataServiceProvider from "./DataServiceProvider";
import { Account } from "./ScheduledPostData";

export default class Accounts extends DataService {
    constructor(data: DataServiceProvider){
        super(data);
    }

    async saveAccount( account : Account ){
        return await this.kv.put(this.accountKey(account), JSON.stringify(account));
    }

    async getAccount( accountKey : string ){
        return await this.kv.get(accountKey);
    }

    async hasAccount(accountKey :string ){
        return await this.kv.get(accountKey).then(data => data !== null);
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

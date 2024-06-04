import { FEEDER_ALLOWED_NETWORK, INSERT_FEEDER_ACCOUNT } from "../db/schemas";
import { IAccounts } from "./Accounts";
import DataService from "./DataService";
import DataServiceProvider from "./DataServiceProvider";
import { Account } from "./ScheduledPostData";


const A_PREFIX = 'A_';


export default class AccountsKv extends DataService implements IAccounts {
    constructor(data: DataServiceProvider){
        super(data);
    }

    private makeAccountKey(account: Account|INSERT_FEEDER_ACCOUNT){
        return `${A_PREFIX}${account.network}:${account.instanceUrl.replace('https://', '')}:${account.accountId}`;
    }

    private accountsByNetworkKey(network: FEEDER_ALLOWED_NETWORK) {
        return `${A_PREFIX}${network}`;
    }

    async saveAccount( account : INSERT_FEEDER_ACCOUNT  ){

        const accountKey = this.makeAccountKey(account);
        try {
            await this.kv.put(accountKey, JSON.stringify({...account,accountKey}));
            return accountKey;
        } catch (error) {
            return false;
        }

    }


    async createAccount( account : INSERT_FEEDER_ACCOUNT  ){
        const accountKey = this.makeAccountKey(account);
        console.log(accountKey);
        if( 'string'!== typeof accountKey ){
            throw new Error("Account key not string");
        }
        console.log({...account,accountKey});
        try {
            await this.kv.put(accountKey, JSON.stringify({...account,accountKey}));
            return accountKey;
        } catch (error) {
            return false;
        }

    }

    async getAccounts(network:FEEDER_ALLOWED_NETWORK|undefined ){
        if( network === undefined ){
            return await this.listAcconts(A_PREFIX);
        }
        return await this.listAcconts(this.accountsByNetworkKey(network));

    }

    private async listAcconts(prefix:string ){
        let completed = false;
        let collection: Account[] = [];
        let cursor = undefined;
        while( ! completed ){
            const {accounts, nextCursor} = await this._list(prefix, cursor);
            collection = [
                ...collection,
                ...accounts
            ];
            cursor = nextCursor;
            completed = ! nextCursor;
        }
        return collection;
    }

    private async _list(prefix:string,cursor?:string): Promise<{
        accounts: Account[],
        nextCursor?: string
    }>{

        const thisList = await this.kv.list({
            prefix,
            cursor,
        });
        const accounts : Account[] = await Promise.all(thisList.keys.map(async ({name}:{
            name:string
        }) => {
            console.log({name})
            if( ! name.endsWith(':undefined') ){
                const data = await this.getAccount(name);

                if( data ){
                    return data as Account;
                }else{
                    return undefined;
                }
            }
        }));
        return {
            accounts: accounts.filter( a => a !== undefined ) as Account[],
            // @ts-ignore
            nextCursor: thisList.list_complete ? thisList.cursor : null
        };


    }

    async getAccount( accountKey : string ):Promise<Account>{
        const data = await this.kv.get(accountKey);
        if( data ){
            return JSON.parse(data) as Account;
        }
        throw new Error("Account not found");

    }

    async deleteAccount( accountKey : string ){
        await this.kv.delete(accountKey);
    }

    async hasAccount(accountKey :string ){
       return await this.kv.get(accountKey) !== null;
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

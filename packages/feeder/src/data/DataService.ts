import DataServiceProvider from "./DataServiceProvider";
import { Account } from "./ScheduledPostData";

export default abstract class DataService{
    private dataService: DataServiceProvider;
    constructor(data: DataServiceProvider) {
        this.dataService = data;
    }
    protected get kv(){
        return this.dataService.kv;
    }

    protected get accounts(){
        return this.dataService.accounts;
    }

    accountKey(account: Account) {
        return `${account.network}:${account.instanceUrl}:A_${account.accountId}`
    }

    scheduledPostKey(postAt: Date, account: Account | string ) {
        const accountKey = 'string' === typeof account ? account : this.accountKey(account);
        //postAt in year month day hour minute as a string
        const at = `${postAt.getFullYear()}${postAt.getMonth()}${postAt.getDate()}${postAt.getHours()}${postAt.getMinutes()}`
        return `${accountKey}:Pt_${at}`;
    }
}

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

    accountKey(account: Account) {
        return `${account.network}:${account.instanceUrl}:A_${account.accountId}`
    }
}

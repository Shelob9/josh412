import { getStatus, getStatuses,getAccount } from "./mastodon";
import {writeFileSync} from 'fs';
describe("getStatus", () => {
    const instanceUrl = "https://mastodon.social";
    const username = "@josh412";
    const accountId = 425078;

    test( 'get a status', async () => {
        const status = await getStatus(instanceUrl,'111018270397014747');
       // writeFileSync('./statuses.json',JSON.stringify(status,null,2));
        expect(status.content).toContain('Good morning');
    });

});

import config from "@lib/config";

export interface Attatchment {
    file: R2ObjectBody
    description: string
    encoding: "image/jpg" | "image/jpeg" | "image/png"
}
export type Attatchments = Attatchment[]
export * from "./bluesky";
export * from "./mastodon";
export * from "./types/bsky";
export * from "./types/generic";
export * from "./types/mastodon";
type SOCIAL_NETWORK = 'mastodon' | 'bluesky';

export function isValidAccontId(accountId: string,network:SOCIAL_NETWORK): boolean {
	if( accountId.length > 0 && ['mastodon','bluesky'].includes(network) ){
		switch (network) {
			case 'mastodon':
				return undefined != mastodonAccountIdToConfig(accountId);
			case 'bluesky':
				return undefined != blueskyDidToCongig(accountId);
			default:
				return false;
		}
	}
	return false;
}
export function mastodonAccountIdToConfig(accountId: string):{
	name: string,
	instanceUrl: string,
	accountId: string,
	slug: 'mastodonSocial'|'fosstodon',
} {
	return config.social.mastodon.find( a => a.accountId === accountId) as {
		name: string,
		instanceUrl: string,
		accountId: string,
		slug: 'mastodonSocial'|'fosstodon',
	};


}

export function blueskyDidToCongig(did:string): {name:string,did:string} | undefined {
	return config.social.bluesky.find( a => a.did === did);
}


export function blueskyPostUriToUrl(uri:string,authorHandle:string){
    //take only the part after app.bsky.feed.post/ in uri
    uri = uri.split('/').slice(-1)[0];
    return `https://bsky.app/profile/${authorHandle}/post/${uri}`;

}

import { Attatchment, Attatchments, cancelScheduled, createMastodonStatus, postBsykyStatus, tryBskyLogin } from ".";
import DataServiceProvider from "../data-service/DataServiceProvider";
import { ScheduledPost } from "../data-service/types";
import { IAccounts, IPostsService } from "./../data-service/types";
export default class PosterService {
    private accountService: IAccounts;
    private postsService: IPostsService;
    constructor(
        private accountKey: string,
        private dataService: DataServiceProvider
    ) {
        this.accountService = dataService.accounts
        this.postsService = dataService.scheduledPosts
    }

    async markSent(postKey: string, statusId: string) {
        await this.postsService.markPostAsSentByKey(postKey, statusId)
    }

    async send(postKey: string): Promise<{
        error: string;
        postKey: string,
        accountKey: string,
        accountLabel?: string,
    } | {
        error: false,
        network: string,
        action: 'created' | 'markedSent',
        accountLabel: string,
        postKey: string,
        accountKey: string,
        statusId?: string,
        url?: string
    }> {
        return new Promise(async (resolve, reject) => {
            const account = await this.accountService.getAccount(this.accountKey)
            if (!account) {
                return { error: "Account not found", postKey, accountKey: this.accountKey }
            }
            const accountLabel = `${account.accountHandle.replace('@', '')}@${account.instanceUrl.replace('https://', '')}`
            const token = await this.accountService.getAccountToken(this.accountKey)

            console.log(`Attempting to send ${postKey} for ${accountLabel} with ${token}`);
            const post = (await this.postsService.getSavedPost(
                postKey
            )) as ScheduledPost
            if (!post) {
                reject({ error: "Post not found", postKey, accountKey: this.accountKey, accountLabel })
            }
            console.log({
                token, account
            })
            if (!token) {
                reject({
                    error: `No token for ${accountLabel}`, postKey, accountLabel, accountKey: this.accountKey
                })
            }
            const attachments = await this.collectAttachments(post);
            const { network } = account

            switch (network) {
                case "mastodon":
                    if (!post.statusId) {
                        try {
                            const created = await createMastodonStatus({
                                token,
                                text: post.text,
                                instanceUrl: account.instanceUrl,
                                visibility: "public",
                                postAt: post.postAt,
                                attachments,
                            })
                            console.log({ mastodon: created, postKey, accountLabel });
                            await this.postsService.updatePost({
                                ...post,
                                statusId: created.id,
                                hasSent: post.postAt ? false : true,
                            })
                            resolve({
                                error: false,
                                network,
                                action: 'created',
                                statusId: post.statusId,
                                accountLabel,
                                postKey,
                                accountKey: this.accountKey,
                                url: created.url,
                            })
                        } catch (error) {
                            console.log({ mastodon: error, postKey, accountLabel })
                            reject({
                                error: "Error creating status",
                                accountLabel,
                                accountKey: this.accountKey,
                                postKey
                            });
                        }
                    } else {
                        try {
                            await this.postsService.markPostAsSentByKey(
                                post.postKey,
                                post.statusId
                            );
                            console.log({ mastodon: 'markedSent', postKey, accountLabel });
                            resolve({
                                error: false,
                                network,
                                action: 'markedSent',
                                statusId: post.statusId,
                                accountLabel,
                                postKey,
                                accountKey: this.accountKey,
                                /// url: created.url,

                            })
                        } catch (error) {
                            console.log({ mastodon: error, postKey, accountLabel })
                            reject({
                                error: "Error marking post as sent",
                                accountLabel,
                                accountKey: this.accountKey,
                                postKey
                            });
                        }

                    }

                    break;
                case "bluesky":
                    const identifier = account.accountHandle.replace("@", "");
                    try {
                        const { agent } = await tryBskyLogin({
                            service: account.instanceUrl,
                            identifier,
                            password: token,
                        })
                        try {
                            const created = await postBsykyStatus({
                                agent,
                                text: post.text,
                                attachments,
                            })

                            await this.postsService.updatePost({
                                ...post,
                                statusId: created.cid,
                                hasSent: true,
                            })
                            resolve({
                                error: false,
                                network,
                                action: 'created',
                                statusId: created.cid,
                                url: created.uri,
                                accountLabel,
                                postKey,
                                accountKey: this.accountKey,
                            })

                        } catch (error) {
                            console.log({
                                bluesky: {
                                    error,
                                }, postKey, accountLabel
                            });


                            reject({
                                error: "Bluesky API error",
                                accountLabel,
                                accountKey: this.accountKey,
                                postKey,
                            });

                        }
                    } catch (error) {
                        reject({
                            error: "Invalid token",
                            accountLabel,
                            accountKey: this.accountKey,
                            postKey
                        });
                    }
                    break;
                default:
                    reject({
                        error: "Network not supported",
                        network,
                        accountLabel,
                        accountKey: this.accountKey,
                        postKey
                    });
            }
        })
    }

    async cancelScheduled(post: ScheduledPost) {
        const account = await this.accountService.getAccount(this.accountKey)
        if (!account) {
            return { error: "Account not found", accountKey: this.accountKey }
        }
        const token = await this.accountService.getAccountToken(this.accountKey);
        if (!token) {
            return { error: "No token", accountKey: this.accountKey }
        }
        switch (account.network) {
            case "mastodon":
                if (post.statusId) {
                    await cancelScheduled({
                        id: post.statusId,
                        token,
                        instanceUrl: account.instanceUrl
                    });
                }
                break;
            default:
                break;
        }
        await this.postsService.deletePost(post.postKey);
    }

    async collectAttachments(post: ScheduledPost): Promise<Attatchments | undefined> {

        if (!post.mediaKeys || !post.mediaKeys.length) {
            return undefined
        }

        let attachments: Array<Attatchment | false> = await Promise.all(post.mediaKeys.map(async (key) => {
            return await this.dataService.getAttatchment(key);

        }));
        attachments = attachments.filter((a: Attatchment | false) => false !== a)
        if (!attachments.length) {
            return undefined
        }
        return attachments as Attatchments;
    }

}

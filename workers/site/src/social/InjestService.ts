import {
    AppBskyEmbedImages,
    AppBskyFeedDefs
} from "@atproto/api";
import { MediaAttachment, Status, getBlueskyStatuses, getBskyLikes, tryBskyLogin } from ".";
import SentPostData from "../data-service/SentPostData";
import { Account } from "../data-service/types";
import { INSERT_REFEEDER_POSTS } from "../db/schemas";
import { getMastodonStatus, getStatuses } from "./mastodon";

export default class InjestService {
    constructor(public account: Account, public token: string, public sentData: SentPostData) {
    }

    private async saveImages(images: MediaAttachment[],
        sentPostId: number,
        refeederRemotePostId: string
    ) {

        //has media?
        if (images.length > 0) {
            //save media
            images.forEach(
                async (media: MediaAttachment) => {
                    const imageExists = await this.sentData.hasSentImage(media.url);
                    if (imageExists) {
                        await this.sentData.updateSentImage(imageExists.id, {
                            alt: media.description,
                            url: media.url,
                            refeederRemotePostId,
                            accountKey: this.account.accountKey,
                            type: media.type,
                            sentPostId,
                        });
                    } else {
                        await this.sentData.addSentImage({
                            alt: media.description,
                            url: media.url,
                            refeederRemotePostId,
                            accountKey: this.account.accountKey,
                            type: media.type,
                            sentPostId,
                        });
                    }
                });
        }
    }

    async saveMastodonPost(post: Status) {
        const replyToId = post.in_reply_to_id || false;
        let inReplyToUrl = undefined;
        if (replyToId) {
            const reply = await getMastodonStatus({
                instanceUrl: this.account.instanceUrl,
                id: replyToId
            });
            if (reply) {
                inReplyToUrl = reply.url;
            }
        }
        const postExists = await this.sentData.sentPostExists(post.id);
        if (postExists) {
            const updatedPost = await this.sentData.updateSentPost(postExists.id, {
                accountKey: this.account.accountKey,
                createdAt: new Date(post.created_at),
                remotePostId: post.id,
                text: post.content,
                url: post.url ?? "",
                inReplyToRemotePostId: post.in_reply_to_id,
                remoteAuthorId: post.account.id,
                inReplyToUrl,
            });
            if (updatedPost) {
                await this.saveImages(post.media_attachments, postExists.id, post.id);
            }
            return updatedPost;

        } else {
            const sentPost = await this.sentData.insertSentPost({
                accountKey: this.account.accountKey,
                createdAt: new Date(post.created_at),
                remotePostId: post.id,
                text: post.content,
                url: post.url ?? "",
                inReplyToRemotePostId: post.in_reply_to_id,
                remoteAuthorId: post.account.id,
                inReplyToUrl,
            });
            if (sentPost) {
                this.saveImages(post.media_attachments, sentPost.id, post.id);
            }
            return sentPost;
        }

    }

    private blueskyPostUrl(accountHandle: string, statusUri: string) {
        return `https://bsky.app/profile/${accountHandle.replace('@', '')}/post/${statusUri.split('/').pop()}`;
    }
    async saveBlueskyPost(status: AppBskyFeedDefs.FeedViewPost) {

        if (!status) {
            return false;
        }
        const exists = await this.sentData.sentPostExists(status.post.cid);
        let inReplyToUrl = undefined;

        if (status.reply) {
            inReplyToUrl = this.blueskyPostUrl(
                // @ts-ignore
                status.reply.root.author.handle as string,
                status.reply.uri as string
            );
        }

        const data: INSERT_REFEEDER_POSTS = {
            accountKey: this.account.accountKey,
            createdAt: new Date(status.post.indexedAt),
            remotePostId: status.post.cid,
            // @ts-ignore
            text: status.post.record.hasOwnProperty("text") ? status.post.record.text as string : " ",
            url: this.blueskyPostUrl(this.account.accountHandle, status.post.uri),
            inReplyToRemotePostId: status.reply ? status.reply.cid as string : undefined,
            remoteAuthorId: status.post.author.did,
        };

        const saveSentImages = async (images: AppBskyEmbedImages.ViewImage[], sentPostId: number) => {
            images.forEach(async (image: AppBskyEmbedImages.ViewImage) => {
                const imageExists = await this.sentData.hasSentImage(image.fullsize);
                const data = {
                    alt: image.alt,
                    url: image.fullsize,
                    refeederRemotePostId: status.post.cid,
                    accountKey: this.account.accountKey,
                    type: "image",
                    sentPostId,

                };
                if (imageExists) {
                    try {
                        await this.sentData.updateSentImage(imageExists.id, data);
                    } catch (error) {
                        console.log({ imageExists, error });
                    }
                } else {
                    try {
                        await this.sentData.addSentImage(data);
                    } catch (error) {
                        console.log({ imageExists, error });
                    }
                }

            });
        };
        if (exists) {
            try {
                const savedPost = await this.sentData.updateSentPost(exists.id, data);
                if (savedPost && status.post.embed && status.post.embed.images) {
                    const type = status.post.embed.$type as string;
                    if (type.startsWith("app.bsky.embed.images") && status.post.embed.images) {
                        const images = status.post.embed.images as AppBskyEmbedImages.ViewImage[];
                        const sentPostId = exists.id;
                        saveSentImages(images, sentPostId);
                    }
                }

            } catch (error) {
                console.log({ error });
                return false;
            }
        } else {
            try {
                const savedPost = await this.sentData.insertSentPost(data);
                if (savedPost && status.post.embed && status.post.embed.images) {
                    const type = status.post.embed.$type as string;
                    if (type.startsWith("app.bsky.embed.images") && status.post.embed.images) {
                        const images = status.post.embed.images as AppBskyEmbedImages.ViewImage[];
                        const sentPostId = savedPost.id;
                        images.forEach(async (image: AppBskyEmbedImages.ViewImage) => {
                            const imageExists = await this.sentData.hasSentImage(image.fullsize);
                            const data = {
                                alt: image.alt,
                                url: image.fullsize,
                                refeederRemotePostId: status.post.cid,
                                accountKey: this.account.accountKey,
                                type: "image",
                                sentPostId,

                            };
                            if (imageExists) {
                                try {
                                    await this.sentData.updateSentImage(imageExists.id, data);
                                } catch (error) {

                                }
                            } else {
                                try {
                                    await this.sentData.addSentImage(data);
                                } catch (error) {
                                    console.log({ error })
                                }
                            }

                        });

                    }
                }
                return true;



            } catch (error) {
                console.log({ error });
                return false;
            }
        }
    }
    async sync({ direction, cursor, type }: {
        direction: "new" | "old",
        cursor?: string,
        type?: "posts" | "likes"
    }) {
        switch (this.account.network) {
            case "mastodon":
                if ('new' === direction) {
                    const hasMore = await this.injestNewMastodonStatuses();
                    return hasMore;
                } else {
                    const newMaxId = await this.injestOldMastonStatuses(cursor);
                    return newMaxId;
                }
                break;
            case "bluesky":
                if ('new' === direction) {
                    const hasMore = await this.syncNewBlueskyStatuses();
                    console.log({ hasMore });
                    return hasMore;
                } else {
                    const nextCursor = await this.syncPageOfBlueskyStatuses(cursor);
                    return nextCursor;
                }
                break;
            default:
                break;
        }
    }

    private async syncNewBlueskyStatuses() {
        const minId = await this.sentData.getMostRecentSentPost(this.account.accountKey);
        if (!minId) {
            return false;
        }
        const cursor = await this.syncPageOfBlueskyStatuses(undefined, minId.remotePostId);
        // if has cursor, keep going return true
        return undefined !== cursor;
    }


    async syncPageOfBlueskyStatuses(

        cursor?: string,
        //Stop when we reach this post
        beforeId?: string
    ) {
        const identifier = this.account.accountHandle.replace("@", "");

        try {
            const { agent, id } = await tryBskyLogin({
                identifier,
                password: this.token,
            });
            const { statuses, statusesCursor } = await getBlueskyStatuses({
                agent,
                actor: id,
                cursor,
            });
            for (const status of statuses) {
                if (beforeId && status.post.cid === beforeId) {
                    return undefined;
                }
                await this.saveBlueskyPost(
                    status,
                );

            }
            return statusesCursor;
        } catch (error) {
            console.log({ error });
            return false;
        }
    }



    private async injestOldMastonStatuses(maxId?: string,) {
        const statuses = await getStatuses(
            this.account.instanceUrl,
            parseInt(this.account.accountId, 10),
            maxId

        );
        return this.savePageOfMastodonStatuses(statuses);
    }

    private prepareIdentifier() {
        return this.account.accountHandle.replace("@", "");
    }

    private async injestMastodonLikes() {

    }

    private async injestBlueskyLikes() {
        const { agent, id } = await tryBskyLogin({
            identifier: this.prepareIdentifier(),
            password: this.token,
        });
        const { likes, likesCursor } = await getBskyLikes({
            agent,
            actor: id,
        });
    }

    private async injestNewMastodonStatuses() {
        const minId = await this.sentData.getMostRecentSentPost(this.account.accountKey);
        if (!minId) {
            return false;
        }
        const statuses = await getStatuses(
            this.account.instanceUrl,
            parseInt(this.account.accountId, 10),
            undefined,//minId
            undefined,//sinceId
            minId.remotePostId,
            40,
        );
        if (statuses.length === 0) {
            console.log({
                minId: minId.remotePostId,

            });
            return false;
        }
        await this.savePageOfMastodonStatuses(statuses);
        return true;
    }

    private async savePageOfMastodonStatuses(
        statuses: Status[],
    ) {

        if (statuses.length === 0) {
            return false;
        }
        for (const status of statuses) {
            await this.saveMastodonPost(status);
        }

        const nextMaxId = statuses[statuses.length - 1].id;
        return nextMaxId;
    }


}

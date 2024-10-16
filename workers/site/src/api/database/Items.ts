import { blueskyPostUriToUrl, BskyPostSimple } from "@app/social";
import {
    Status as MastodonStatus
} from "@app/types/mastodon";
import { Item, PrismaClient } from "@prisma/client";
import { Classification } from "./Classifications";
import { Pagignation } from "./types";
export type ItemWithClassification = ItemWithAuthor &{
    classifications: Classification[]
}

const validateSourceType = (type: string): boolean => {
    return ['bluesky', 'twitter', 'mastodon', 'wordpress'].includes(type);
}

export type ItemAuthor = {
    url: string,
    displayName: string,
    avatar: string,
    handle: string
    uuid: string
}
export type ItemWithAuthor =  Item & {
    author: ItemAuthor
};
export type SourceArg = {
    url: string,
    type: string
}


export type CreateItemArgs ={
    content: string
    //url, without https
    source: string
    //mastodon, twitter, bluesky, wordpress
    sourceType: string
    remoteId: string
    remoteReplyToId: string | null
    remoteReplyToAuthorId: string | null
    remoteAuthorId: string,
    url: string
    author: {
        handle: string
        avatar: string
        displayName: string
        url: string
    }
}

export type Processed = Item&{
    created :boolean,
}
// Omit<Item, 'uuid'>
export default class ItemsApi {

    perPage: number = 25;

    public constructor(private prisma: PrismaClient,private kv: KVNamespace) {
        this.prisma = prisma;
        this.kv = kv;
    }

    private prepareSource = (source:string):string => {
        //remove https:// and trailing slash
        return source.replace(/^https?:\/\//,'').replace(/\/$/,'');
    }

    public async create(data: CreateItemArgs):Promise<Item> {
        try {
            const remoteAuthorExists = await this.hasRemoteAuthor({
                source: data.source,
                sourceType: data.sourceType,
                remoteAuthorId: data.remoteAuthorId
            });
            if( ! remoteAuthorExists ){
                await this.createRemoteAuthor({
                    source: data.source,
                    sourceType: data.sourceType,
                    remoteId: data.remoteAuthorId,
                    handle: data.author.handle,
                    avatar: data.author.avatar,
                    displayName: data.author.displayName,
                    url: data.author.url
                });
            }
            try {
                const item = await this.prisma.item.create({
                    data:{
                        content: data.content,
                        remoteId: data.remoteId,
                        source: data.source,
                        sourceType: data.sourceType,
                        remoteAuthorId: data.remoteAuthorId,
                        remoteReplyToId: data.remoteReplyToId,
                        remoteReplyToAuthorId: data.remoteReplyToAuthorId,
                        url: data.url
                    }
                });
                return item;
            } catch (error) {
                console.log({303:error});
                throw new Error('Could not create source');

            }
        } catch (error) {
            console.log({308:error});
            throw new Error('Could not create source');
        }




    }

    async injestBluesky({statuses}:{
        statuses: BskyPostSimple[]
    }): Promise<Processed[]> {

        const sourceArg = {
            source: 'bsky.social',
            sourceType: 'bluesky',
        }
        const processed: Processed[] = [];
        for(const status of statuses){


            const exists = await this.hasItem({
                source:sourceArg.source,
                remoteId: status.cid
            });
            if( exists ){
                processed.push({
                    ...exists,
                    created:false,
                });
                continue;
            }
            try {
                const reply = status.reply ? status.reply : null;
                const created = await this.create({
                    ...sourceArg,
                    content: status.text,
                    remoteId: status.cid,
                    remoteAuthorId: status.author.did,
                    remoteReplyToId: status.reply ? status.reply.cid : null,
                    remoteReplyToAuthorId: reply ? reply.author.did : null,
                    author: {
                        handle: status.author.handle,
                        avatar: status.author.avatar,
                        displayName: status.author.displayName,
                        url: `https://bsky.app/profile/${status.author.handle}`
                    },
                    url: blueskyPostUriToUrl(status.uri,status.author.handle)

                });
                processed.push({
                    ...created,
                    created:true,
                });

            } catch (error) {
                console.log({error});
                throw new Error('Could not create item');
            }
        }
        return processed

    }
    async injestMastodon({statuses,source}:{
        statuses: MastodonStatus[],
        source: 'mastodonSocial'|'fosstodon'
    }): Promise<Processed[]> {

        const sourceArg = {
            source,
            sourceType: 'mastodon',
        }
        const processed:Processed[] = [];
        for(const status of statuses){
            const exists = await this.hasItem({
                source: sourceArg.source,
                remoteId: status.id
            });
            if( exists ){
                processed.push({
                    ...exists,
                    created:false,
                });
                continue;
            }
            try {
                const created = await this.create({
                   ...sourceArg,
                    content: status.content,
                    remoteId: status.id,
                    remoteAuthorId: status.account.id,
                    remoteReplyToId: status.in_reply_to_id ?? null,
                    remoteReplyToAuthorId: status.in_reply_to_account_id ?? null,
                    author: {
                        handle: status.account.acct,
                        avatar: status.account.avatar,
                        displayName: status.account.display_name,
                        url: status.account.url
                    },
                    url: status.url as string

                });
                processed.push({
                    ...created,
                    created:true,
                });
            } catch (error) {
                console.log({error});

            }



        }
        return processed

    }

    public async hasItem({
        source,
        remoteId,

    }:{
        source: string,
        remoteId: string,
    }): Promise<Item|false> {
        const item = await this.prisma.item.findFirst({
            where: {
                remoteId,
                source,

            }
        });
        if(item){
            return item;
        }
        return false;
    }


    public async hasRemoteAuthor({
        source,
        sourceType,
        remoteAuthorId,
    }: {
        source: string,
        sourceType: string,
        remoteAuthorId: string
    }): Promise<string|false> {
        const author = await this.prisma.remoteAuthor.findFirst({
            where: {
                remoteId: remoteAuthorId,
                source,
                sourceType
            }
        });
        if(author){
            return author.uuid;
        }
        return false;
    }

    async createRemoteAuthor({
        source,
        sourceType,
        remoteId,
        handle,
        avatar,
        displayName,
        url
    }: {
        source: string,
        sourceType: string,
        remoteId: string,
        url: string;
        avatar: string;
        displayName: string;
        handle: string;
    }) {
        const author = await this.prisma.remoteAuthor.create({
            data: {
                source,
                sourceType,
                remoteId,
                handle,
                avatar,
                displayName,
                url
            }
        });
        return author;
    }

    async search({query,page,perPage}:{

        query: string,
        page: number,
        perPage: number
    }) {
        const items = await this.prisma.item.findMany({
            where: {
                content: {
                    contains: query
                }
            },
            ...this.argsToSkipTake({page,perPage})
        });
        return items;
    }

    //total number of items
    async totalPages(args: Pagignation&{
        source?: string,
        sourceType?: string
    }): Promise<number> {
        let where = undefined;
        if(args.source || args.sourceType){
            where = {
                source: args.source,
                sourceType: args.sourceType
            }
        }

        const count = await this.prisma.item.count({
            where,
        });
        return Math.ceil(count / (args.perPage ?? 25));

    }

    async all(args: Pagignation&{
        source?: string,
        sourceType?: string,
        withClassification?: boolean
    }): Promise<ItemWithClassification[]> {
        let where = undefined;
        if(args.source || args.sourceType){
            where = {
                source: args.source,
                sourceType: args.sourceType
            }
        }

        const items = await this.prisma.item.findMany(
            {
                    ...this.argsToSkipTake(args),
                    where,


            }
        );
        const authors = await this.prisma.remoteAuthor.findMany({
            where: {
                remoteId: {
                    in: Array.from(new Set(items.map((a) => a.remoteAuthorId)))
                },
            }
        });

        return await Promise.all(items.map(async (item:Item) => {
            const author = authors.find((a) => a.remoteId === item.remoteAuthorId);
            const classifications = await this.getItemClassifications(
                item.uuid
            )
            return {
                ...item,
                author: author ?{
                    url: author.url,
                    displayName: author.displayName,
                    avatar: author.avatar,
                    handle: author.handle,
                    uuid: author.uuid
                }: {
                    url: '',
                    displayName: '',
                    avatar: '',
                    handle: '',
                    uuid: ''
                } as ItemAuthor,
                classifications,
            }
        }));
    }

    async allByType(args: Pagignation&{
        sourceType: string
    }): Promise<Item[]> {

        const items = await this.prisma.item.findMany(
            {
                    ...this.argsToSkipTake(args),
                    where: {
                        sourceType: args.sourceType
                    }
            }
        );
        return items as Item[];
    }

    private async  getItemClassifications(uuid: string): Promise<Classification[]> {
        return this.prisma.classification.findMany({
            where: {
                item: uuid
            }
        });
    }

    async get(uuid: string): Promise<ItemWithClassification> {

        const item = await this.prisma.item.findUnique({
            where: {
                uuid: uuid
            }
        });
        if (!item) {
            throw new Error("Item not found");
        }
        const classifications = await this.getItemClassifications(item.uuid);
        return {
            ...item,
            classifications
        } as ItemWithClassification
    }


    async allRemoteAuthors(args: Pagignation) {
        const uniqueAuthors = await this.prisma.item.findMany({
            distinct: ['remoteAuthorId','source'],
            select: {
                source: true,
                sourceType: true,
                remoteAuthorId: true,
            },
            ...this.argsToSkipTake(args)
        });
        const authors = await this.prisma.remoteAuthor.findMany({
            where: {
                remoteId: {
                    in: uniqueAuthors.map((a) => a.remoteAuthorId)
                },
            }
        });
        return authors;
    }



    async delete(uuid: string): Promise<boolean> {
        try {
            await this.prisma.item.delete({
                where: {
                    uuid
                }
            });



            return true;
        } catch (e) {
            return false;
        }
    }

    async update({ content, uuid }: {
        content: string;
        uuid: string;
    }): Promise<Item> {
        await this.prisma.item.update({
            where: {
                uuid
            },
            data: {
                content
            }
        });
        return this.get(uuid);
    }

    async allSources(args: Pagignation & {
        type?: string
    }):Promise<{source: string, sourceType: string}[]> {
        //select unique values for source from items table
        const sources = await this.prisma.item.findMany({
            distinct: ['source'],
            select: {
                source: true,
                sourceType: true
            },

            ...this.argsToSkipTake(args)
        });
        return sources;
    }


    private argsToSkipTake(args: Pagignation) {
        return {
            skip: args?.page ? args.page - 1: 0,
            take: args?.perPage ?? 25
        }
    }

}

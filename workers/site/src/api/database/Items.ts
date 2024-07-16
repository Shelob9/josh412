import {
    Account as MastodonAccount,
    Status as MastodonStatus
} from "@app/types/mastodon";
import { PrismaClient, Source } from "@prisma/client";
import { Pagignation } from "./types";

export type Item = {
    uuid: string;
    remote_id: string;
    item_type: string;
    remote_reply_to_id?: string;
    content?: string;
};
const validateSourceType = (type: string): boolean => {
    return ['bluesky', 'twitter', 'mastodon', 'wordpress'].includes(type);
}

export type SourceArgs = {
    url: string,
    type: string
    uuid?: string
}
export type SourceArg = SourceArgs

export type CreateRemoteAuthorArgs = {
    remoteId: string
    remoteHandle: string
    remoteDisplayName?: string | null
    source: SourceArg
    uuid?: string
}
export type RemoteAuthorArg =  CreateRemoteAuthorArgs
export type CreateItemArgs = {
    content: string;
    source: SourceArg;
    remoteId: string;
    remoteAuthor: RemoteAuthorArg;
    remoteReplyAuthor?: RemoteAuthorArg;
    remoteReplyToId?: string
}
export default class ItemsApi {

    perPage: number = 25;

    public constructor(private prisma: PrismaClient,private kv: KVNamespace) {
        this.prisma = prisma;
        this.kv = kv;
    }

    private cacheKey({
        accountId,
        sourceId,
    }:{
        accountId: string,
        sourceId: string
    }) {
        return `items-${accountId}-${sourceId}`;
    }
    async injestMastodon({statuses}:{
        statuses: MastodonStatus[]
    }){
        const remoteAuthorArg = (account:MastodonAccount) :RemoteAuthorArg => {
            return {
                remoteId: account.id,
                remoteHandle: account.username,
                remoteDisplayName: account.display_name,
                source: {
                    type: 'mastodon',
                    url: account.url.replace(account.username,'')
                }
            }
        }
        const remoteSourceArg = (status:MastodonStatus) :SourceArg => {
              // Split the URL at '/@' and take the first part
                const baseUrl = status.account.url.split('/@')[0];
                return {
                    type: 'mastodon',
                    url: baseUrl
                };
        }


        const processed: {
            remoteAuthor: RemoteAuthorArg,
            source: SourceArg,
            content: string,
            remoteId: string,
            remoteReplyToId?: string,
            uuid: string |false,
            created:boolean
        }[] = [];
        for(const status of statuses){
            const remoteAuthor = remoteAuthorArg(status.account);
            const source = remoteSourceArg(status);
            console.log({source});

            const sourceId = await this.sourceArgToSourceUuid(source);
            console.log({sourceId,source});

            const exists = await this.hasItem({
                sourceId: sourceId,
                remoteId: status.id
            });
            if( exists ){
                processed.push({
                    created: false,
                    remoteAuthor,
                    source,
                    content: status.content,
                    remoteId: status.id,
                    remoteReplyToId: status.in_reply_to_id ?? undefined,
                    uuid: sourceId
                });
                continue;
            }
            try {
                const created = await this.create({
                    remoteAuthor,
                    source,
                    content: status.content,
                    remoteId: status.id,
                    remoteReplyToId: status.in_reply_to_id ?? undefined
                });
                processed.push({
                    created: true,
                    remoteAuthor,
                    source,
                    content: status.content,
                    remoteId: status.id,
                    remoteReplyToId: status.in_reply_to_id ?? undefined,
                    uuid: created ? created.uuid : false
                });
            } catch (error) {
                console.log({error});

            }



        }
        return processed

    }

    public async hasItem({
        sourceId,
        remoteId,

    }:{
        sourceId: string,
        remoteId: string,
    }){
        const item = await this.prisma.item.findFirst({
            where: {
                remoteId,
                sourceId,

            }
        });
        return !!item;
    }
    public async create({
        content,
        remoteId,
        source,
        remoteAuthor,
        remoteReplyToId
    }: CreateItemArgs) {
        try {
            if( ! await this.hasSource(source) ){
                 await this.createSource(source);
            }
            const sourceModel = await this.prisma.source.findFirst({
                where: source
            });
            if( ! sourceModel ){
                throw new Error('Could not create source');
            }
            const item = await this.prisma.item.create({
                data: {
                    content,
                    remoteId,
                    remoteReplyToId,
                    source: {
                        connect: {
                            uuid: sourceModel.uuid,
                            type: sourceModel.type
                        }
                    },
                    remoteAuthor: {
                        connectOrCreate: {
                            where: {
                                remoteId: remoteAuthor.remoteId,
                                sourceId:sourceModel.uuid,
                                uuid: remoteAuthor.uuid ?? undefined,
                                sourceId_remoteId: {
                                    remoteId: remoteAuthor.remoteId,
                                    sourceId: sourceModel.uuid
                                }
                            },
                            create: {
                                remoteId: remoteAuthor.remoteId,
                                remoteHandle: remoteAuthor.remoteHandle,
                                remoteDisplayName: remoteAuthor.remoteDisplayName,
                                source: {
                                    connect: {
                                        uuid: sourceModel.uuid
                                    }
                                }
                            }
                        }
                    },


                }
            });
            return item;
        } catch (error) {
            throw new Error('Could not create source');
        }




    }




    async all(args: Pagignation): Promise<Item[]> {

        const items = await this.prisma.item.findMany( this.argsToSkipTake(args));
        return items as Item[];
    }

    async getBySourceUuid({sourceId,page,perPage}: {
        sourceId: string;

    }&Pagignation) {
        page = page || 1;
        perPage = perPage || this.perPage;
        const items = await this.prisma.item.findMany({
            ...this.argsToSkipTake({page,perPage}),
            where: {
                sourceId,
            }
        });
        return items;
    }

    async get(uuid: string): Promise<Item> {

        const item = await this.prisma.item.findUnique({
            where: {
                uuid: uuid
            }
        });
        if (!item) {
            throw new Error("Item not found");
        }
        return item as Item;
    }

    private async remoteAuthorExists({ remoteId, sourceId }: {
        remoteId: string;
        sourceId: string;
    }) {
        const author = await this.prisma.remoteAuthor.findFirst({
            where: {
                remoteId,
                sourceId
            }
        });
        return author ?? false;
    }

    private async createOrFindRemoteAuthor({ remoteId, remoteHandle, remoteDisplayName, source }: CreateRemoteAuthorArgs) {
        const sourceId = await this.sourceArgToSourceUuid(source);
        const exists = await this.remoteAuthorExists({ remoteId, sourceId });
        if (exists) {
            return await this.getRemoteAuthor({ remoteId, sourceId });
        }
        return await this.createRemoteAuthor({ remoteId, remoteHandle, remoteDisplayName, source });
    }

    async createRemoteAuthor({
        remoteId, remoteHandle, remoteDisplayName, source
    }: CreateRemoteAuthorArgs) {

        const sourceId = 'object' === typeof source ? await this.createOrFindSourceUuid(source.type, source.url) : source;
        const author = await this.prisma.remoteAuthor.create({
            data: {
                remoteId, remoteHandle, remoteDisplayName, sourceId
            }
        });
        return author;
    }

    async allRemoteAuthors(args: Pagignation) {
        const authors = await this.prisma.remoteAuthor.findMany(this.argsToSkipTake(args));
        return authors;
    }

    async getRemoteAuthor({ remoteId, sourceId }: {
        remoteId: string;
        sourceId: string;
    }) {
        const author = await this.prisma.remoteAuthor.findFirst({
            where: {
                remoteId,
                sourceId
            }
        });
        return author ?? false
    }

    async updateRemoteAuthor({ remoteId, remoteHandle, remoteDisplayName, sourceId } = c.body as unknown as {
        remoteId: string
        remoteHandle: string
        remoteDisplayName?: string | null
        sourceId: string
    }) {

        const author = await this.prisma.remoteAuthor.update({
            where: {
                sourceId_remoteId: {
                    remoteId,
                    sourceId
                }
            }, data: {
                remoteHandle,
                remoteDisplayName
            }
        });
        return author;

    }

    async deleteRemoteAuthor(uuid: string) {
        try {
            await this.prisma.remoteAuthor.delete({
                where: {
                    uuid
                }
            });
            return true;
        } catch (error) {
            return false;
        }
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

    private async sourceArgToSource(source: SourceArg) {
        if ('string' === typeof source) {
            return await this.getSource(source);
        }
        return await this.createOrFindSource(source)
    }
    private async sourceArgToSourceUuid(source: SourceArg): Promise<string> {
        const sourceId = 'object' === typeof source ? await this.createOrFindSourceUuid(source.type, source.url) : source;
        return sourceId;
    }

    private async hasSource(source: SourceArg) {
        const sourceRecord = await this.prisma.source.findFirst({ where: source });
        return !!sourceRecord;
    }

    private async createOrFindSource(where:SourceArgs): Promise<Source> {
        const sourceRecord = await this.prisma.source.findFirst({ where});
        if (sourceRecord) {
            return sourceRecord;
        }
        const newSource = await this.prisma.source.create({
            data: where
        });
        return newSource;
    }

    private async createOrFindSourceUuid(type: string, url: string): Promise<string> {
        const sourceRecord = await this.createOrFindSource({
                type,
                url
        });
        return sourceRecord.uuid;
    }


    async getSource(uuid: string) {
        try {
            const source = await this.prisma.source.findFirst({
                where: {
                    uuid
                }
            });
            return source;
        } catch (error) {
            return false;
        }
    }

    async updateSource({ uuid, type, url }: {
        uuid: string;
        type: string;
        url: string;
    }) {
        if (!validateSourceType(type)) {
            throw new Error('Invalid source type');
        }
        try {
            await this.prisma.source.update({
                where: {
                    uuid
                }, data: {
                    type,
                    url
                }
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    async createSource({ type, url }: {
        type: string;
        url: string;
    }) {
        if (!validateSourceType(type)) {
            throw new Error('Invalid source type');
        }

        try {
            const newSource = await this.prisma.source.create({
                data: {
                    type,
                    url
                }
            });
            return newSource.uuid;
        } catch (error) {
            return false;
        }
    }

    async deleteSource(uuid: string) {
        try {
            await this.prisma.source.delete({
                where: {
                    uuid
                }
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    private argsToSkipTake(args: Pagignation) {
        return {
            skip: args?.page ? args.page - 1: 0,
            take: args?.perPage ?? 25
        }
    }
    async allSources(args: Pagignation & {
        type?: string
    }) {
        let query: {
            skip: number,
            take: number,
            where?: {
                type: string
            }

        } = this.argsToSkipTake(args);
        if (args.type) {
            query = {
                ...query,
                where: {
                    type: args.type
                }
            }
        }
        console.log({args,query});
        const sources = await this.prisma.source.findMany(query);
        return sources
    }
}

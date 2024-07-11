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
}
export type SourceArg = string | SourceArgs

export type CreateRemoteAuthorArgs = {
    remoteId: string
    remoteHandle: string
    remoteDisplayName?: string | null
    source: SourceArg
}
export type RemoteAuthorArg = string | CreateRemoteAuthorArgs
export type CreateItemArgs = {
    content: string;
    source: SourceArg;
    remoteId: string;
    remoteAuthor: RemoteAuthorArg;
    remoteReplyAuthor?: RemoteAuthorArg;
    remoteReplyToId?: string
}
export default class ItemsApi {



    public constructor(private prisma: PrismaClient) {
    }

    public async create({
        content,
        remoteId,
        source,
        remoteAuthor,
        remoteReplyAuthor,
        remoteReplyToId
    }: CreateItemArgs) {
        const sourceModel = await this.sourceArgToSource(source);
        if( ! sourceModel || null === sourceModel ){
            throw new Error(`Source ${source} does not exist`);
        }
        const sourceId = await this.sourceArgToSourceUuid(source);
        let remoteAuthorUuid : string;
        let remoteReplyAuthorUuid : string | null = null;
        if ('string' === typeof remoteAuthor) {
            const exists = await this.remoteAuthorExists({ remoteId: remoteAuthor, sourceId });
            if (!exists ) {
                throw new Error(`Remote Author ${remoteId} does not exist`);
            }
            remoteAuthorUuid = exists.uuid;
        }else{
            const  createdRemoteAuthor = await this.createOrFindRemoteAuthor(remoteAuthor);
            if( !createdRemoteAuthor ){
                throw new Error(`Failed to create remote author ${remoteId} `);
            }
            remoteAuthorUuid = createdRemoteAuthor.uuid;
        }

        if (remoteReplyAuthor) {
            if ('string' === typeof remoteReplyAuthor) {
                const exists = await this.remoteAuthorExists({ remoteId: remoteReplyAuthor, sourceId });
                if (!exists) {
                    throw new Error(`Remote Reply Author ${remoteReplyAuthor} does not exist`);
                }
                remoteReplyAuthorUuid = exists.uuid;
            }else{
                const  createdRemoteAuthor = await this.createOrFindRemoteAuthor(remoteReplyAuthor);
                if( !createdRemoteAuthor ){
                    throw new Error(`Failed to create remote author ${remoteReplyAuthor.remoteId}`);
                }
                remoteReplyAuthorUuid = createdRemoteAuthor.uuid;
            }
        }


        const item = await this.prisma.item.create({
            data: {
                content,
                remoteId,
                sourceId,
                remoteReplyToId,

                remoteAuthor: {
                    connect: {
                        uuid: remoteAuthorUuid
                    }
                },
                remoteReplyAuthor: remoteReplyAuthorUuid ? {
                    connect: {
                        uuid: remoteReplyAuthorUuid
                    }
                } : undefined,
                source: {
                    connect: {
                        uuid: sourceModel.uuid,
                        type: sourceModel.type,
                    }
                }
            }
        });
        return item;
    }



    async all(args: Pagignation): Promise<Item[]> {
        const page = args && args.page || 1;
        const perPage = args && args.perPage || 10;
        const items = await this.prisma.item.findMany({
            skip: (page - 1) * perPage,
            take: perPage,
        });
        return items as Item[];
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

    async allSources(args: Pagignation & {
        type?: string
    }) {
        let query: {
            skip: number,
            take: number,
            where?: {
                type: string
            }

        } = {
            skip: args?.page ?? 0,
            take: args?.perPage ?? 25
        };
        if (args.type) {
            query = {
                ...query,
                where: {
                    type: args.type
                }
            }
        }

        const sources = await this.prisma.source.findMany(query);
        return sources
    }
}

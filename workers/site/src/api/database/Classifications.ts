import { Classification, Item } from "@prisma/client";
import DbApi from "./DbApi";
import { ItemSource } from "./Items";
import { ItemWithAll, Pagignation } from "./types";


export default class ClassificationsApi extends DbApi {


    async all(args: Pagignation&{
        itemType?: string;
        classification?: string;
        item?: string;
    }): Promise<Classification &{
        item:ItemWithAll;
        itemUuid:string;
    }[]> {
        const page = args && args.page || 1;
        const perPage = args && args.perPage || 10;
        const results  : Classification[]= await this.prisma.classification.findMany({
            skip: (page - 1) * perPage,
            take: perPage,
            where:  args.itemType ? {
                item_type: args.itemType,
                classification: args.classification ?? undefined,
                item: args.item ?? undefined,
            }: undefined,
            orderBy: {
                createdAt: 'desc',
            },

        });
        const itemUuids = results.map((result) => result.item);
        const items = await this.prisma.item.findMany({
            where: {
                uuid: {
                    in: itemUuids,
                },
            },
        });
        const itemMap = items.reduce((acc, item) => {
            //@ts-ignore
            acc[item.uuid] = item;
            return acc;
        }, {});

        const findAuthor = async (remoteAuthorId: string) => {
                try {
                    const author = await this.findAuthor(remoteAuthorId).catch(() => {
                        return undefined;
                    });
                    return author;
                } catch (error) {
                    return undefined;

                }
        }

        return await Promise.all(results.map(async (result) => {
            //@ts-ignore
            const item = await this.decorateItem(
                itemMap[result.item] as Item,
                findAuthor
            );

            return {
                ...result,
                itemUuid: result.item,
                item,
            }
        }));

    }

    async allForSource(args:Pagignation &{
        source:ItemSource;
        classification:string;
    }): Promise<Classification[]> {
        const {
            classification
        } = args;
        const page = args && args.page || 1;
        const perPage = args && args.perPage || 10;
        const offset = (page - 1) * perPage;
        const source = args.source === 'bluesky' ? 'bsky.social' : args.source;
        console.log({ source });
        const results = await this.prisma.$queryRaw`
        SELECT classification.*,
        item.uuid as itemUuid,
        item.source as itemSource,
        item.sourceType as itemSourceType,
        item.remoteId as itemRemoteId
        FROM classification
        JOIN item ON item.uuid = classification.item
        WHERE item.source = ${source} AND classification = ${classification}
        ORDER BY classification.createdAt DESC
        LIMIT ${perPage} OFFSET ${offset}` as undefined | {
             uuid: string;
             item: string;
             item_type: string;
             classification: string;
             parent_uuid: string | null;
             createdAt: string;
             itemSource: string;
             itemSourceType: string;
             itemRemoteId: string;

        }[];
        if(!results || results.length === 0) {
            return [];
        }
        return results.map((result):Classification &{
            itemUuid: string;
            itemSource: string;
            itemSourceType: string;
            itemRemoteId: string;
        } => {
            return {
                uuid: result.uuid,
                item: result.item,
                itemUuid: result.item,
                item_type: result.item_type,
                classification: result.classification,
                parent: result.parent_uuid,
                createdAt: new Date(result.createdAt),
                itemSource: result.itemSource,
                itemSourceType: result.itemSourceType,
                itemRemoteId: result.itemRemoteId,

            }
        });

    }

    async get(uuid: string): Promise<Classification> {
        const result = await this.prisma.classification.findFirst({
            where: { uuid },
        });
        if (!result) {
            throw new Error("Not found");
        }
        return result as Classification;
    }

    async create({ classification, item, parent, item_type }: Omit<Classification, 'uuid'>): Promise<string> {
        const result = await this.prisma.classification.upsert({
            create: {
                classification,
                item,
                parent,
                item_type,
            },
            update: {
                classification,
                item,
                parent,
                item_type,
            },
            where: {
                item_item_type: {
                    item,
                    item_type,
                },
            },
        });
        return result.uuid;
    }

    async exists({item, item_type}: {
        item:string;
        item_type:string;
    }): Promise<boolean> {

        const result = await this.prisma.classification.count({
            where: {
                item,
                item_type,
            },
        });
        return result > 0;
    }

    async createMany(classifications: Omit<Classification, 'uuid'>[]): Promise<number> {
        await Promise.all(classifications.map(async (classification) => await this.create(classification) ))
        .catch((error) => {
            console.error({ error });
        });
        return classifications.length;
    }

    async delete(uuid: string): Promise<boolean> {
        try {
            await this.prisma.classification.delete({
                where: { uuid },
            });
            return true;
        } catch (error) {
            console.error({ error });
            return false;
        }
    }

    async deleteAll(): Promise<boolean> {
        try {
            await this.prisma.classification.deleteMany({});
            return true;
        } catch (error) {
            console.error({ error });
            return false;
        }
    }
}

import { Classification, Item, PrismaClient } from "@prisma/client";
import { Pagignation } from "./types";


export default class ClassificationsApi {
    public constructor(private prisma: PrismaClient) {
    }

    async all(args: Pagignation&{
        itemType?: string;
    }): Promise<Classification &{
        item:Item;
        itemUuid:string;
    }[]> {
        const page = args && args.page || 1;
        const perPage = args && args.perPage || 10;
        const results  : Classification[]= await this.prisma.classification.findMany({
            skip: (page - 1) * perPage,
            take: perPage,
            where:  args.itemType ? {
                item_type: args.itemType
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
        return results.map((result) => ({
            ...result,
            itemUuid: result.item,
            //@ts-ignore
            item: itemMap[result.item] as Item,
        }))


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

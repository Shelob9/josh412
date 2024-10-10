import { Item, PrismaClient } from "@prisma/client";
import { Pagignation } from "./types";

export type Classification = {
    uuid: string;
    //item uuid
    item: string;
    //item source type
    item_type: string;
    classification: string;
    parent?: string|null;
};
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
        const result = await this.prisma.classification.create({
            data: {
                classification,
                item,
                item_type,
                parent,
            },
        });
        return result.uuid;
    }

    async createMany(classifications: Omit<Classification, 'uuid'>[]): Promise<number> {
        const results = await this.prisma.classification.createMany({
            data: classifications,
        });
        return results.count;
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

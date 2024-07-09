import { PrismaClient } from "@prisma/client";
import { Pagignation } from "./types";

export type Classification = {
    uuid: string;
    item: string;
    item_type: string;
    classification: string;
    parent?: string;
};
export default class ClassificationsApi {
    public constructor(private prisma: PrismaClient) {
    }

    async all(args: Pagignation): Promise<Classification[]> {
        const page = args && args.page || 1;
        const perPage = args && args.perPage || 10;
        const results = await this.prisma.classification.findMany({
            skip: (page - 1) * perPage,
            take: perPage,
        });
        return results as Classification[]
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
}

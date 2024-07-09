import { Clipping } from "@app/types";
import { PrismaClient } from "@prisma/client";
import { Pagignation } from "./types";


export default class ClippingsApi {
    constructor(private prisma: PrismaClient) {
    }

    async all(args: Pagignation): Promise<Clipping[]> {
        const perPage = args && args.perPage || undefined;
        try {
            const clippings = await this.prisma.clipping.findMany({
                take: perPage
            })
            return clippings as Clipping[];
        } catch (error) {
            console.log({ error })
            return [];

        }
    }
    async get(uuid: string): Promise<Clipping> {
        try {
            return await this.prisma.clipping.findFirst({
                where: { uuid }
            }) as Clipping
        } catch (error) {
            throw new Error("Not found");

        }

    }

    async update({ text, uuid }: {
        uuid: string,
        text: string
    }): Promise<boolean> {
        try {
            this.prisma.clipping.update({
                where: { uuid },
                data: { text }
            })
            return true;

        } catch (error) {
            console.log({error})
            return false;
        }
    }
    async create({ domain, path, text }: {
        domain: string,
        text: string,
        path?: string
    }): Promise<string> {
        const clipping = await this.prisma.clipping.create({
            data: {
                domain,
                path,
                text,
            },
        });
        return clipping.uuid;
    }

    async delete(uuid: string): Promise<boolean> {
        try {
            await this.prisma.clipping.delete({
                where: { uuid },
            });
            return true;
        } catch (error) {
            console.log({ error });
            return false;
        }
    }

}

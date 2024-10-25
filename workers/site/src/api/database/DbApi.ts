import { Classification, Item, Media, PrismaClient, RemoteAuthor } from "@prisma/client";
import { ItemAuthor, ItemWithAll } from "./types";

export default abstract class DbApi {
    protected prisma: PrismaClient;
    protected kv: KVNamespace;

    public constructor( prisma: PrismaClient, kv: KVNamespace) {
        this.prisma = prisma;
        this.kv = kv;
    }

    async allMediasByItemsUuids(uuids: string[],emptyKeyOnly:boolean = false): Promise<Media[]> {
        const items = await this.prisma.item.findMany({
            where: {
                uuid: {
                    in: uuids
                },
            },
            select: {
                uuid: true
            }
        });
        if(! items || items.length === 0){
            return [];
        }
        const item = {
            in: items.map((item) => item.uuid)
        }
        return this.prisma.media.findMany({
            where: emptyKeyOnly ? {
                AND: {
                    item,
                    key: null
                }

            } : {
                item
            }
        });
    }

    async allMediaByIds(ids: string[]): Promise<Media[]> {
        return this.prisma.media.findMany({
            where: {
                uuid: {
                    in: ids
                }
            }
        });
    }
    protected async findAuthor(remoteId:string){
        const author = await this.prisma.remoteAuthor.findFirst({
            where: {
                uuid: remoteId,
            },
        });
        if(!author){
            throw new Error(`Author not found ${remoteId}`);
        }
        return author;
    }

    protected async decorateItem(item: Item,findAuthor:(remoteAuthorId:string)=>RemoteAuthor|undefined): Promise<ItemWithAll> {

        const author = findAuthor( item.remoteAuthorId);
        const classifications = await this.getItemClassifications(
            item.uuid
        )
        const media = await this.getItemMedia({
            item: item.uuid
        });
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
            media,
        }

    }

    protected async decorateItems(items: Item[],findAuthor:(remoteId:string)=>RemoteAuthor|undefined): Promise<ItemWithAll[]> {
        return await Promise.all(items.map(async (item:Item) => await this.decorateItem(item,findAuthor)));
    }

    protected async  getItemClassifications(uuid: string): Promise<Classification[]> {
        return this.prisma.classification.findMany({
            where: {
                item: uuid
            }
        });
    }

    async getItemMedia({item}:{
        item: string
    }) {
        return this.prisma.media.findMany({
            where: {
                item
            }
        });
    }

    async deleteItemMedia({item}:{
        item: string
    }) {
        return this.prisma.media.deleteMany({
            where: {
                item
            }
        });
    }

    async setMediaKey({uuid,key}:{
        uuid: string,
        key: string
    }) {
        return this.prisma.media.update({
            where: {
                uuid
            },
            data: {
                key
            }
        });
    }

    async upsertMedia({url,key, item, itemType,description,height,width,remoteId,previewUrl}:{
        url: string,
        item: string,
        itemType: string,
        description: string,
        height: number,
        width: number,
        key?: string,
        remoteId: string,
        previewUrl?: string
    }): Promise<Media> {
        return this.prisma.media.upsert({
            where: {
                url,
                item_itemType:{
                    item,
                    itemType
                }

            },
            create: {
                url,
                item,
                itemType,
                description,
                height,
                width,
                remoteId,
                previewUrl,
                key,
            },
            update: {
                description,
                height,
                width,
                remoteId,
                previewUrl,
                key,
            }
        });
    }

}

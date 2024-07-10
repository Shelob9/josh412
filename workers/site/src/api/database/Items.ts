import { PrismaClient } from "@prisma/client";
import { Pagignation } from "./types";

export type Item = {
    uuid: string;
    remote_id: string;
    item_type: string;
    remote_reply_to_id?: string;
    content?: string;
};
const validateSourceType = (type: string) :boolean=> {
    return ['bluesky','twitter', 'mastodon', 'wordpress'].includes(type);
}


export default class ItemsApi {



    public constructor(private prisma : PrismaClient) {
    }




    async all(args: Pagignation):Promise<Item[]>{
        const page = args && args.page || 1;
        const perPage = args && args.perPage || 10;
         const items = await this.prisma.item.findMany({
            skip: (page - 1) * perPage,
            take: perPage,
         });
        return items as Item[];
     }
    async get(uuid:string):Promise<Item>{

        const item = await this.prisma.item.findUnique({
            where: {
                uuid: uuid
            }
        });
        if(! item){
            throw new Error("Item not found");
        }
        return item as Item;
    }

   async createRemoteAuthor({
        remoteId,remoteHandle,remoteDisplayName,source
   }:{
        remoteId: string
        remoteHandle: string
        remoteDisplayName?: string | null
        source: string | {
            url: string,
            type: string
        }
    }
   ){

    const sourceId = 'object' === typeof source ? await this.createOrFindSourceId(source.type,source.url) : source;
    const author = await this. prisma.remoteAuthor.create({ data: {
        remoteId,remoteHandle,remoteDisplayName,sourceId
     } });
    return author;
   }

   async updateRemoteAuthor({ remoteId,remoteHandle,remoteDisplayName,sourceId } = c.body as unknown as {
        remoteId: string
        remoteHandle: string
        remoteDisplayName?: string | null
        sourceId: string
    }){

        const author = await this.prisma.remoteAuthor.update({ where: {
            sourceId_remoteId: {
                remoteId,
                sourceId
            }
        },data: {
            remoteHandle,
            remoteDisplayName
        } });
        return author;

    }

    async deleteRemoteAuthor(uuid:string){
        try {
            await this.prisma.remoteAuthor.delete({ where: {
                uuid
             } });
             return true;
        } catch (error) {
            return false;
        }
    }

    async delete(uuid:string):Promise<boolean>{
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

    async update({content,uuid}:{
        content: string;
        uuid: string;
    }):Promise<Item>{
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

    private async  createOrFindSourceId(type:string,url:string):Promise<string>{
        const sourceRecord = await this.prisma.source.findFirst({ where: {
            type,
            url
         } });
         if( sourceRecord ) {
             return sourceRecord.uuid;
         }
         const newSource = await this.source.create({ data: {
             type,
             url
          } });
          return newSource.uuid;
    }

    async getSource(uuid:string){
        try {
            const source = await this.prisma.source.findFirst({ where: {
                uuid
             } });
             return source;
        } catch (error) {
            return false;
        }
    }

    async updateSource({uuid,type,url}:{
        uuid:string;
        type:string;
        url:string;
    }){
        if( ! validateSourceType(type) ) {
            throw new Error('Invalid source type');
        }
        try {
            await this.prisma.source.update({ where: {
                uuid
             }, data: {
                type,
                url
             } });
             return true;
        } catch (error) {
            return false;
        }
    }

    async createSource({type,url}:{
        type:string;
        url:string;
    }){
        if( ! validateSourceType(type) ) {
            throw new Error('Invalid source type');
        }

        try {
            const newSource = await this.prisma.source.create({ data: {
                type,
                url
            }});
            return newSource.uuid;
        } catch (error) {
            return false;
        }
    }

    async deleteSource(uuid:string){
        try {
            await this.prisma.source.delete({ where: {
                uuid
             } });
             return true;
        } catch (error) {
            return false;
        }
    }

    async allSources( args:Pagignation &{
        type?:string
    } ){
        let query :{
            skip:number,
            take:number,
            where?:{
                type:string
            }

        } = {
            skip: args?.page ?? 0,
            take: args?.perPage ?? 25
        };
        if( args.type ){
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

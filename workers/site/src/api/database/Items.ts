import { Pagignation } from "./types";

export type Item = {
    uuid: string;
    remote_id: string;
    item_type: string;
    content?: string;
};


export default class ItemsApi {


    public constructor(private DB: D1Database) {
    }

    async all(args: Pagignation):Promise<Item[]>{
        const page = args && args.page || 1;
        const perPage = args && args.perPage || 10;
         const {results} = await this.DB.prepare(
             "SELECT * FROM items LIMIT ? OFFSET ?",
         )
             .bind(perPage, (page - 1) * perPage)
             .all();
         return results as Item[]|| [];
     }
    async get(uuid:string):Promise<Item>{
        const { results } = await this.DB.prepare(
            "SELECT * FROM items WHERE uuid = ?",
        )
            .bind(uuid)
            .all();
        if( ! results.length) {
            throw new Error("Not found");
        }
        return results[0] as Item;
    }

    async create({remote_id,item_type,content}:Omit<Item,'uuid'>):Promise<string>{
        const uuid = crypto.randomUUID();
        if( content ) {
           await this.DB.prepare(
               "INSERT INTO items (uuid, remote_id, item_type, content) VALUES (?, ?, ?, ?)",
           )
               .bind(uuid, remote_id, item_type, content)
               .run();
           return uuid;
        }else{
           await this.DB.prepare(
               "INSERT INTO items (uuid, remote_id, item_type) VALUES (?, ?, ?)",
           )
               .bind(uuid, remote_id, item_type)
               .run();

        }

        return uuid;

    }

    async delete(uuid:string):Promise<boolean>{
        try {
            await this.DB.prepare(
                "DELETE FROM items WHERE uuid = ?",
            )
                .bind(uuid)
                .run();
            return true;
        } catch (e) {
            return false;
        }
    }

    async update({content,uuid}:{
        content: string;
        uuid: string;
    }):Promise<Item>{
        await this.DB.prepare(
            "UPDATE items SET content = ? WHERE uuid = ?",
        )
            .bind(content, uuid)
            .run();
        return this.get(uuid);
    }
}

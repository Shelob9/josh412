import { Pagignation } from "./types";

export type Classification = {
    uuid: string;
    item: string;
    item_type: string;
    classification: string;
    parent?: string;
};
export default class ClassificationsApi {


    public constructor(private DB: D1Database) {
    }
    async all(args: Pagignation):Promise<Classification[]>{
        const page = args && args.page || 1;
        const perPage = args && args.perPage || 10;
         const {results} = await this.DB.prepare(
             "SELECT * FROM classifications LIMIT ? OFFSET ?",
         )
             .bind(perPage, (page - 1) * perPage)
             .all();
         return results as Classification[]|| [];
     }
     async get(uuid:string):Promise<Classification>{
         const { results } = await this.DB.prepare(
             "SELECT * FROM classifications WHERE uuid = ?",
         )
             .bind(uuid)
             .all();
         if( ! results.length) {
             throw new Error("Not found");
         }
         return results[0] as Classification;
     }


     async create({classification,item,parent,item_type}:Omit<Classification,'uuid'>):Promise<string>{
         const uuid = crypto.randomUUID();
         if( parent ) {
            await this.DB.prepare(
                "INSERT INTO classifications (uuid, classification, item, item_type, parent) VALUES (?, ?, ?, ?)",
            )
                .bind(uuid, classification, item,item_type, parent)
                .run();
            return uuid;
         }else{
            await this.DB.prepare(
                "INSERT INTO classifications (uuid, classification, item, item_type) VALUES (?, ?, ?)",
            )
                .bind(uuid, classification, item, item_type)
                .run();

         }

         return uuid;

     }

     async delete(uuid:string):Promise<boolean>{
         try {
             await this.DB.prepare(
                 "DELETE FROM classifications WHERE uuid = ?",
             )
                 .bind(uuid)
                 .run();
             return true;

 //DOES NOT ACTUALLY THROW
         } catch (error) {
             console.log({error})
             return false
         }
         return true;
     }
}

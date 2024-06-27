import { Pagignation } from "./database/types";

export type Classification = {
    uuid: string;
    item: string;
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
         return results;
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
         return results[0];
     }


     async create({classification,item,parent}:Omit<Classification,'uuid'>):Promise<string>{
         const uuid = crypto.randomUUID();
         if( parent ) {
            await this.DB.prepare(
                "INSERT INTO classifications (uuid, classification, item, parent) VALUES (?, ?, ?, ?)",
            )
                .bind(uuid, classification, item, parent)
                .run();
            return uuid;
         }else{
            await this.DB.prepare(
                "INSERT INTO classifications (uuid, classification, item) VALUES (?, ?, ?)",
            )
                .bind(uuid, classification, item)
                .run();
            await this.DB.prepare(
             "INSERT INTO classifications (uuid, classification, item, parent) VALUES (?, ?, ?, ?)",
         )
             .bind(uuid, classification, item, parent)
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

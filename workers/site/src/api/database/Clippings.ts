import { D1Database } from "@cloudflare/workers-types";
import { Pagignation } from "./types";

export type Clipping = {
    uuid: string;
    domain: string;
    path: string;
    text:string
};
export default class ClippingsApi{
    constructor(private DB: D1Database) {

    }

    async all(args: Pagignation):Promise<Clipping[]>{
       const page = args && args.page || 1;
       const perPage = args && args.perPage || 10;
        const {results} = await this.DB.prepare(
            "SELECT * FROM clippings LIMIT ? OFFSET ?",
        )
            .bind(perPage, (page - 1) * perPage)
            .all();
        return results;
    }
    async get(uuid:string):Promise<Clipping>{
        const { results } = await this.DB.prepare(
            "SELECT * FROM clippings WHERE uuid = ?",
        )
            .bind(uuid)
            .all();
        if( ! results.length) {
            throw new Error("Not found");
        }
        return results[0];
    }

    async update({text,uuid}:{
        uuid:string,
        text:string
    }):Promise<boolean>{
        await this.DB.prepare(
            "UPDATE clippings SET text = ? WHERE uuid = ?",
        )
            .bind(text, uuid)
            .run();
        return true;
    }

    async create({domain, path, text}:{
        domain:string,
        text:string,
        path?:string
    }):Promise<string>{
        path = path || '';
        const uuid = crypto.randomUUID();
        await this.DB.prepare(
            "INSERT INTO clippings (uuid, domain, path, text) VALUES (?, ?, ?, ?)",
        )
            .bind(uuid,domain, path, text)
            .run();
        return uuid;
    }

    async delete(uuid:string):Promise<boolean>{
        try {
            await this.DB.prepare(
                "DELETE FROM clippings WHERE uuid = ?",
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

import { Args } from "./args";
import { Post } from "./content";
import WritePaths from "./WritePaths";

export default class SiteFromStatic {

    public writePaths:WritePaths;
    constructor(args:Args) {

        this.writePaths = new WritePaths(args);
    }


    async postById(id: number): Promise<Post> {
        const post = await Bun.file(this.writePaths.postPath(id)).json();
        return post as Post;
    }

    async authorById(id: number) {
        const author = await Bun.file(this.writePaths.authorPath(id)).json();
        return author;
    }

    async tagById(id: number) {
        const tag = await Bun.file(this.writePaths.tagPath(id)).json();
        return tag;
    }

    async categoryById(id: number) {
        const category = await Bun.file(this.writePaths.categoryPath(id)).json();
        return category;
    }

}

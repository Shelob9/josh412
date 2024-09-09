import { Args, Paths } from "./args";

export default class WritePaths {
    public outputDir: string;
    public paths:Paths;

    constructor({paths,outputDir}:Args) {
        this.outputDir = outputDir;
        this.paths = paths;
    }


    postPath(id: number): string {
        return `${this.outputDir}/${this.paths.posts.to}/${id}.json`
    }

    authorPath(id: number): string {
        return `${this.outputDir}/${this.paths.authors.to}/${id}.json`
    }

    tagPath(id: number): string {
        return `${this.outputDir}/${this.paths.tags.to}/${id}.json`
    }

    categoryPath(id: number): string {
        return `${this.outputDir}/${this.paths.categories.to}/${id}.json`
    }
}

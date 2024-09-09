import { Args, Paths } from "./args";
import { Author, Post } from "./content";
import WritePaths from "./WritePaths";



export default class SiteToStatic {
  public baseUrl: string;
  public outputDir: string;
  public paths:Paths;
  private writePaths: WritePaths;
  public auth? :{
    username:string;
    password:string;
  }


  private getPath(path: keyof Paths,to:'to'|'from'): string {
    return this.paths[path][to];
  }
  constructor(args:Args) {
    this.baseUrl = args.baseUrl;
    this.outputDir = args.outputDir;
    this.paths = args.paths;
    this.auth = args.auth ?? undefined
    this.writePaths = new WritePaths(args);
  }

  private async fetch(url:string):Promise<Response>{
    const headers = new Headers();
    if(this.auth){
      headers.set('Authorization', 'Basic ' + btoa(`${this.auth.username}:${this.auth.password}`));
    }
    return await fetch(url,{
      headers,
    });
  }

  async fetchAllPostsByAuthor(id: string): Promise<Post[]> {
    const posts = await this.recursiveFetch<Post>(`${this.baseUrl}/wp-json/wp/v2/${this.getPath('posts','from')}?author=${id}`);
    return posts;
  }

  async writeAllPostsByAuthor(id: number): Promise<void> {
    await this.recursiveFetch<Post>(`${this.baseUrl}/wp-json/wp/v2/${this.getPath('posts','from')}?author=${id}`, 1, [], async (page: number, posts: Post[]) => {
      console.log(`Posts by author ${id} page ${page}`);
      for (const post of posts) {
        await Bun.write(this.writePaths.postPath(post.id), JSON.stringify(post));

      }
    }
    );
  }

  async writeAllTags(): Promise<void> {

    await this.recursiveFetch(`${this.baseUrl}/wp-json/wp/v2/${this.getPath('posts','from')}`, 1, [], async (page: number, tags: any[]) => {
      console.log(`Tags page ${page}`);
      for (const tag of tags) {
        await Bun.write(this.writePaths.tagPath(tag.id), JSON.stringify(tag));
      }
    }
    );
  }

  async writeAllCategories(): Promise<void> {
    await this.recursiveFetch(`${this.baseUrl}/wp-json/wp/v2/${this.getPath('categories','from')}`, 1, [], async (page: number, categories: any[]) => {
      console.log(`Categories page ${page}`);
      for (const category of categories) {
        await Bun.write(this.writePaths.categoryPath(category.id), JSON.stringify(category));
      }
    }
    );
  }

  async writeAllAuthors(): Promise<Author[]> {
    return await this.recursiveFetch<Author>(`${this.baseUrl}/wp-json/wp/v2/${this.getPath('authors','from')}`, 1, [], async (page: number, authors: any[]) => {
      console.log(`Authors page ${page}`);
      for (const author of authors) {
        await Bun.write(this.writePaths.authorPath(author.id), JSON.stringify(author));
      }
    }
    );
  }

  async writeAuthorById(id: number): Promise<void> {
    const author = await this.fetch(`${this.baseUrl}/wp-json/wp/v2/${this.getPath('authors','from')}/${id}`).then(r =>r.json()) as Author;
    console.log(this.writePaths.authorPath(author.id));

    await Bun.write(this.writePaths.authorPath(author.id), JSON.stringify(author));
  }

  async writeAll(): Promise<void> {
    const authors: Author[] = await this.writeAllAuthors();
    await Promise.all([
      this.writeAllTags(),
      this.writeAllCategories(),
      ...authors.map(async author => {
        await this.writeAllPostsByAuthor(author.id);
      })
    ]);

  }




  async writePost(post: Post, path: string): Promise<void> {
    await Bun.write(`${this.outputDir}/${path}/${post.id}.json`, JSON.stringify(post));
  }

  private async recursiveFetch<T>(url: string, page: number = 1, accumulatedResults: T[] = [],
    onPage?: (page: number, data: T[]) => Promise<void>
  ): Promise<T[]> {
    const requestUrl = `${url}${url.includes('?') ? '&': '?'}page=${page}`;
    const response = await this.fetch(requestUrl);
    try {
      const data = await response.json() as T[];
      const totalPages = parseInt(response.headers.get('x-wp-totalpages') || '1', 10);
      if (onPage) {
        await onPage(page, data);
      }
      accumulatedResults = accumulatedResults.concat(data);

      if (page < totalPages) {
        return this.recursiveFetch(url, page + 1, accumulatedResults, onPage ?? undefined);
      } else {
        return accumulatedResults;
      }
    } catch (error) {
      throw new Error(`Failed to fetch ${requestUrl}: ${error}`);

    }
  }


}

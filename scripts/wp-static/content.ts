export interface Post {
    title: {

      rendered: string;
    },
    content: {
      rendered: string;
    },
    author: number;
    id: number;
    excerpt: {
      rendered: string;
    },
  }
 export interface Author {
    id: number;
    name: string;
    url: string;
    description: string;
    link: string;
    slug: string;

  }

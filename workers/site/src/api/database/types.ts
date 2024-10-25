import { Classification, Item, Media } from "@prisma/client";

export type Pagignation = undefined|{
    page?:number,
    perPage?:number
};

export type ItemWithAll = Item& {
    author: ItemAuthor

    classifications: Classification[]
    media: Media[]
}

export type ItemAuthor = {
    url: string,
    displayName: string,
    avatar: string,
    handle: string
    uuid: string
}

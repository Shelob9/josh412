export type Status_Link_Image = {
    url: string
    type: string
    height: string
    width: number
}

export type Status_Link = {
    // would be better if this was a data uri
    url: string
    thumb?: Blob
    title?: string
    image?: Status_Link_Image
    description?: string
    mediaKey?: string
}

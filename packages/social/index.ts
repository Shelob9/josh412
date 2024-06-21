import PosterService from "./PosterService"

export interface Attatchment {
    file: R2ObjectBody
    description: string
    encoding: "image/jpg" | "image/jpeg" | "image/png"
}
export type Attatchments = Attatchment[]
export * from "./bluesky"
export * from "./mastodon"
export * from "./PosterService"
export * from "./types/bsky"
export * from "./types/generic"
export * from "./types/mastodon"

export {
    PosterService
}

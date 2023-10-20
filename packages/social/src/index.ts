export const socialTest = () => console.log('social test');

export interface Attatchment {
    file: Blob;
    description: string;
    encoding: "image/jpg"| "image/png";

}
export type Attatchments = Attatchment[];
export * from './types/mastodon';
export * from './mastodon';
export * from './bluesky';

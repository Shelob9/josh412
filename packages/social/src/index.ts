export const socialTest = () => console.log('social test');
interface Buffer extends Uint8Array {
}
export interface Attatchment {
    file: Buffer;
    description: string;
    encoding: "image/jpg"| "image/png";

}
export type Attatchments = Attatchment[];
export * from './mastodon';
export * from './bluesky';

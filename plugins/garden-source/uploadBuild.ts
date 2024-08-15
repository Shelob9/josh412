import { $ } from "bun";
import { readdir } from "fs/promises";
const bucketName = 'josh412-cdn-1';
(await readdir("./build", { withFileTypes: true })).filter(async(file) => {
    if( file.isDirectory() ) {
        return;
    }
    const {exitCode,sterr} = await $`wrangler r2 object put ${bucketName}/wp-content/plugins/garden-source/build/${file.name} --file=./build/${file.name}`;
    if( 1 === exitCode ) {
        console.error({sterr});
        throw new Error('Failed to upload file');
    }
});

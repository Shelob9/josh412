import { Args } from './wp-static/args';
import SiteFromStatic from './wp-static/from-static';
import SiteToStatic from './wp-static/to-static';
(async () => {
    const paths = {
        tags: {
            from: 'tags',
            to: 'tags'
        },
        categories: {
            from: 'categories',
            to: 'categories'
        },
        posts: {
            from: 'posts',
            to: 'posts'
        },
        authors: {
            from: 'users',
            to: 'authors'
        }
    };
    const joshArgs: Args = {
        baseUrl: 'https://josh412.com',
        outputDir: 'josh412',
        paths,
        auth: {
            username: 'josh412bot',
            password: '9Z7h 7buH 3Mrd UVd4 EiFA 6RrQ'
        }
    }
    const torqueArgs: Args = {
        baseUrl: 'https://torquemag.io',
        outputDir: 'content/torque',
        paths,

    }
    const toStatic = new SiteToStatic(torqueArgs);
    const fromStatic = new SiteFromStatic(torqueArgs);
    //await toStatic.writeAuthorById(133);
    //await toStatic.writeAllPostsByAuthor(133);
    const post = await fromStatic.postById(69450);

})()

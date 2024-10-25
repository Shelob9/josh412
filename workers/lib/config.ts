type MediaUploadConfig = {
    mastodonSocial: string[],
    fosstodon: string[],
    bluesky: string[],
}
export type ServiceConfig = {
    cacheSeconds: number;
    uri: string;
    social: {
        mastodon: {
            name: string;
            instanceUrl: string;
            accountId: string;
            slug: string;
        }[];
        bluesky: {
            name: string;
            did: string;
            slug: string;
        }[];
    };
    mediaUploads: MediaUploadConfig;

}

const config: ServiceConfig = {
    cacheSeconds: 604800,
    uri: `https://josh412.com`,
    social: {
        mastodon: [
            {
                name:'josh412',
                instanceUrl: 'https://mastodon.social',
                accountId: '425078',
                slug: 'mastodonSocial',
            },
            {
                name: "josh412",
                instanceUrl: 'https://fosstodon.org',
                accountId: '109276361938539865',
                slug: 'fosstodon'
            }
        ],
        bluesky: [
            {
                name: "josh412.com",
                did: "did:plc:payluere6eb3f6j5nbmo2cwy",
                slug: 'bluesky'
            }
        ],
    },
    mediaUploads: {
        mastodonSocial: [
            "gm",
        ],
        fosstodon: [],
        bluesky: [],
    }
};
export default config;

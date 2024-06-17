export const accounts = {
    mastodonSocial: {
        type: 'mastodon',
        name:'josh412',
        instanceUrl: 'https://mastodon.social',
        id: '425078',
    },
    fosstodon:{
        type: 'mastodon',
        name: "josh412",
        instanceUrl: 'https://fosstodon.org',
        id: '109276361938539865',
    },
    bluesky: {
        type: 'bluesky',
        name: "josh412.com",
        id: "did:plc:payluere6eb3f6j5nbmo2cwy"
    }
}

export const accountOptions = [
    {
        value: 'bluesky',
        label: 'Bluesky',
    },
    {
        value: 'mastodonSocial',
        label: 'Mastodon Social',
    },
    {
        value: 'fosstodon',
        label: 'Fosstodon',
    }
]

const config = {
    mastodon: [
        {
            name:'josh412',
            instanceUrl: 'https://mastodon.social',
            accountId: '425078',
        },
        {
            name: "josh412",
            instanceUrl: 'https://fosstodon.org',
            accountId: '109276361938539865',
        }
    ],
    bluesky: [
        {
            name: "josh412.com",
            did: "did:plc:payluere6eb3f6j5nbmo2cwy"
        }
    ],
}

const api = {
	getPosts: () => {
		return fetch('https://jsonplaceholder.typicode.com/posts')
			.then(response => response.json())
			.then(json => json);
	}
};

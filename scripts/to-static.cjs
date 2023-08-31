const SITE_URL = 'https://joshpress.net';
const ENDPOINTS = [
    '/',
    '/about'
];
const NEW_URL = 'https://josh412.com';
const https = require('https');
const fs = require('fs');
const { dirname } = require('path');
const processChunk  = (chunk) => {
    return chunk.replace(SITE_URL, NEW_URL);
}
const getPage = async (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, function(response) {
            let output = '';
            response.on('data', (chunk) => {
                output += processChunk(chunk.toString());
            });
            response.on('end', () => resolve(output));
            response.on('error', (error) => reject(error));
        });
    });
}

const savePage = async (endpoint, body) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(dirname + 'data/' + endpoint, body, (error) => {
            if (error) {
                reject(error);
            }
            resolve();
        });
    });
}


const toStatic = async (originalUrl,newUrl, endpoints = []) => {
    for (const endpoint of endpoints) {
        const url = originalUrl + endpoint;
        const body = await getPage(url);
        await savePage(endpoint, body);
    }
}





//async iffe
(async () => {
    await toStatic(SITE_URL, NEW_URL, ENDPOINTS);
})();

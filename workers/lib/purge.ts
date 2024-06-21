export async function purgeCfCache(urls:string[],cf:{
    zoneId:string
    bearer:string
}){

    const body = urls.length ? {
        files: urls
    } : {
        purge_everything: true
    }
    fetch(`https://api.cloudflare.com/client/v4/zones/${cf.zoneId}/purge_cache`,{
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${cf.bearer}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
}

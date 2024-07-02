export function removeProtocol(url: string) {
    return url.replace(/(^\w+:|^)\/\//, "")
}

export function removeAtSign(username: string) {
    return username.replace("@", "")
}

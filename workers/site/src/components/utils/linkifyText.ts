import findLinks, { isValidHttpUrl } from "./findLinks";

/**
 * Add links to URLs in the text
 *
 * @see https://stackoverflow.com/a/71734086
 */
const linkifyText = (text: string) => {
    const matches = findLinks(text);
    if (!matches) {
        return text
    }
    const links = []
    matches.forEach((match: string) => {
        const [t1, ...t2] = text.split(match)
        links.push(t1)
        text = t2.join(match)
        const y = (!match.match(/:\/\//) ? "https://" : "") + match
        if (isNaN(parseInt(match, 10)) && isValidHttpUrl(y))
            links.push(
                '<a href="' +
                y +
                '" target="_blank">' +
                y.split("/")[2] +
                "</a>"
            )
        else links.push(match)
    })
    links.push(text)
    return links.join("")
}
export default linkifyText;

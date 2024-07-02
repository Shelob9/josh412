export default function findLinks(text: string): string[] | false {
    const matches = text.match(
        /(?<=\s|^)[a-zA-Z0-9-:/]+\.[a-zA-Z0-9-].+?(?=[.,;:?!-]?(?:\s|$))/g
    );
    if (!matches) {
        return false;
    }
    if (matches.length) {
        //loop through and remove invalid links
        for (let i = 0; i < matches.length; i++) {
            if (!isValidHttpUrl(matches[i])) {
                matches.splice(i, 1);
            }
        }
    }
    if (matches && matches.length) {
        return matches;
    }
    return false;
}

export const isValidHttpUrl = (string: string) => {
    try {
        new URL(string)
    } catch (_) {
        return false
    }
    return string.startsWith("https://")
        || string.startsWith("http://")
}

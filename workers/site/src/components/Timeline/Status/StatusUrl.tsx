export default function StatusUrl({ url }: { url: string }) {
    return (
        <a href={url} target="_blank" rel="noopener noreferrer">
            {url}
        </a>
    )
}

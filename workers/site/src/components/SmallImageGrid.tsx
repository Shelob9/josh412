export default function SmallImageGrid({
    images,
}: {
    images: {
        key: string
        url: string
        alt: string
    }[]
}) {
    return (
        <div className="flex pl-4 flex h-24 overflow-hidden pl-4">
            {images.map(({ key, url, alt }) => {
                return (
                    <div key={key} className="w-1/3">
                        <a href={url} target="_blank" rel="noopener noreferrer">
                            <img
                                className="w-24 h-24 ascpect-square"
                                src={url}
                                alt={alt}
                            />
                        </a>
                    </div>
                )
            })}
        </div>
    )
}

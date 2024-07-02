import SmallImageGrid from "@app/components/SmallImageGrid"
import { useMemo } from "react"

export type Status_Image = {
    id: string | number
    url: string
    alt: string
    type: string
}
export type Status_Images = Status_Image[] | undefined | null
export default function StatusImages({ images }: { images: Status_Images }) {
    const imagesForGrid = useMemo(() => {
        if (!images || images.length <= 0) {
            return []
        }
        return images.map((image) => {
            return {
                ...image,
                key: image.id.toString(),
            }
        })
    }, [images])
    return (
        <>
            <SmallImageGrid images={imagesForGrid} />
        </>
    )
}

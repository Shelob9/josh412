import linkifyText from "@app/components/utils/linkifyText"
import StatusImages, { Status_Images } from "./StatusImages"

export default function StatusContent({
    content,
    network,
    images,
    contextType,
}: {
    content: string
    network: 'mastodon' | 'bluesky'
    images: Status_Images
    contextType: "sent" | "timeline"
}) {
    return (
        <div>
            <div
                dangerouslySetInnerHTML={{ __html: linkifyText(content) }}
                className={`${contextType}-post-content ${network}-${contextType}-post-content`}
            />
            <StatusImages images={images} />
        </div>
    )
}

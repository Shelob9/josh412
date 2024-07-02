import usePostAtDate from "../../hooks/usePostAtDate"

export default function StatusPostedAt({
    postedAt,
}: {
    postedAt: string | undefined
}) {
    const { postAtString } = usePostAtDate({
        postAt: postedAt ? new Date(postedAt) : undefined,
        isSchedulingDisabled: false,
    })
    return <>{postAtString}</>
}

import { Fragment } from "react"
import { Table_Button_Props } from "."

export default function TableWrapper({
    children,
    title,
    topButtons,
}: {
    children: React.ReactNode
    title: React.ReactNode | string
    topButtons?: Table_Button_Props[]
}) {
    return (
        <section className="card col-span-12 overflow-hidden bg-base-100 shadow-sm xl:col-span-7">
            <div className="card-body grow-0">
                <div className="flex justify-between gap-2">
                    <h2 className="card-title grow">
                        <a className="link-hover link">{title}</a>
                    </h2>
                    {topButtons?.map((button: Table_Button_Props) => (
                        <Fragment key={button.id}>{button.children}</Fragment>
                    ))}
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="table table-zebra">{children}</table>
            </div>
        </section>
    )
}

import { useState } from "react"
import TableHeader from "./TableHeader"
import TableWrapper from "./TableWrapper"
import Tbody, { Table_Row } from "./Tbody"

export type Table_Button_Props = {
    children: React.ReactNode | string
    onClick: () => void
    id: string
    className?: string
}

export type Render_Table_Action = ({
    accountKey,
}: {
    accountKey: string
}) => JSX.Element | null
export type Table_Action = {
    key: string
    RenderAction: Render_Table_Action
}

export type Table_Props = {
    children?: React.ReactNode
    title: React.ReactNode | string
    topButtons?: Table_Button_Props[]
    actions?: Table_Action[]
    rows: Table_Row[]
    headers: string[]
}

export default function Table({
    title,
    topButtons,
    children,
    actions,
    headers,
    rows,
}: Table_Props) {
    const [checked, setChecked] = useState<string[]>([])

    return (
        <TableWrapper title={title} topButtons={topButtons}>
            <>
                {children ? (
                    children
                ) : (
                    <>
                        <TableHeader
                            headers={headers}
                            allSelected={
                                rows ? checked.length === rows.length : false
                            }
                            toggleSelectAll={() => {
                                if (!rows) {
                                    return
                                }
                                if (checked.length === rows.length) {
                                    setChecked([])
                                } else {
                                    setChecked(
                                        rows.map((row: Table_Row) => row.key)
                                    )
                                }
                            }}
                        />
                        <Tbody
                            rows={rows}
                            actions={actions}
                            checked={checked}
                            setChecked={setChecked}
                        />
                    </>
                )}
            </>
        </TableWrapper>
    )
}

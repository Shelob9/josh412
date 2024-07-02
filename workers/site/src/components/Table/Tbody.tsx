import { Table_Action } from "."
import Tr, { Td_Avatar_Props, Td_Props } from "./Tr"

export type Table_Row = {
    key: string
    avatar: Td_Avatar_Props
    data: Td_Props[]
}
export default function Tbody({
    rows,
    checked,
    setChecked,
    actions,
}: {
    rows: Table_Row[]
    checked: string[]
    setChecked: (checked: string[]) => void
    actions?: Table_Action[]
}) {
    return (
        <tbody>
            {rows.length
                ? rows.map((row) => {
                      return (
                          <Tr
                              key={row.key}
                              checked={checked.includes(row.key)}
                              onCheck={(rowChecked: boolean) => {
                                  if (rowChecked) {
                                      setChecked([...checked, row.key])
                                  } else {
                                      setChecked(
                                          checked.filter(
                                              (key) => key !== row.key
                                          )
                                      )
                                  }
                              }}
                              avatar={row.avatar}
                              data={row.data}
                              actions={actions}
                          />
                      )
                  })
                : null}
        </tbody>
    )
}

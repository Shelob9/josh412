import { createElement, Fragment } from "react"
import { Table_Action } from "."
const PosterAvatar = ({avatar}:{
    avatar: Td_Avatar_Props
}) => {
    return createElement(
        avatar.href ? "a" : "div",
        avatar.href
            ? {
                  href: avatar.href,
                  target: "_blank",
                  rel: "noreferrer",
                  className: "flex items-center gap-4",
              }
            : {
                  className: "flex items-center gap-4",
              },
        <>
            <div className="avatar">
                <div className="mask mask-squircle h-10 w-10">
                    <img src={avatar.src} alt={avatar.alt} />
                </div>
            </div>
            <div>
                <div className="text-sm font-bold">{avatar.textTop}</div>
                {avatar.textBottom ? (
                    <div className="text-xs opacity-50">
                        {avatar.textBottom}
                    </div>
                ) : null}
            </div>
        </>
    )
}

export type Td_Avatar_Props = {
    src: string
    alt: string
    textTop: string
    textBottom?: string
    href?: string
}
export type Td_Props = {
    children: React.ReactNode | string
    key: string
    className?: string
}
export default function Tr({
    checked,
    onCheck,
    avatar,
    data,
    actions,
}: {
    checked: boolean
    onCheck: (checked: boolean) => void
    avatar: Td_Avatar_Props
    data: Td_Props[]
    actions?: Table_Action[]
}) {
    return (
        <tr>
            <td className="w-0">
                <input
                    checked={checked}
                    // @ts-ignore
                    onChange={(e) => onCheck(e.target.checked)}
                    type="checkbox"
                    className="checkbox"
                />
            </td>
            <td>
                <PosterAvatar avatar={avatar} />
            </td>
            {data.map((td) => {
                /// <reference path="" />
                return (
                    <Fragment key={td.key}>
                        <td className={td.className ?? ""}>{td.children}</td>
                    </Fragment>
                )
            })}
            {actions
                ? actions.map((action) => {
                      return (
                          <Fragment key={action.key}>
                              <td>
                                  {action.RenderAction({
                                      accountKey:
                                          avatar.textBottom ?? avatar.textTop,
                                  })}
                              </td>
                          </Fragment>
                      )
                  })
                : null}
        </tr>
    )
}

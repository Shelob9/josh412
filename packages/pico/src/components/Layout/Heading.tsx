import { createElement } from "react"


export  function HGroup({
	children,
	p,
	level
}:{
	children: React.ReactNode,
	p: string,
	level: 1|2|3|4|5|6
}) {
	return <hgroup>
	<Heading level={level}>{children}</Heading>
	<p>{p}</p>
  </hgroup>
}

export default function Heading({
	level,
	children,
	className
}:{
	level: 1|2|3|4|5|6,
	children: React.ReactNode,
	className?: string
}) {
	return createElement(`h${level}`, {
		className
	}, children)
}

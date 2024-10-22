export default function Card({
	title,
	children,
	footer
}:{
	title: string,
	children: React.ReactNode,
	footer: React.ReactNode
}){
	return (
		<article>
			<header>
				{title}
			</header>
				{children}
			<footer>
				{footer}
			</footer>
		</article>
	)
}

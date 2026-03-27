export default function Grid({
	children,
	className
}:{
	children: React.ReactNode,
	className?: string
}) {
	return <div className={`grid${className ? ` ${className}` : ''}`}>
		{children}
	</div>
}

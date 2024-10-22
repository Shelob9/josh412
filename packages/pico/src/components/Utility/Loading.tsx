export default function Loading({
	  className,
	  children
}:{
	children?: React.ReactNode,
  className?: string
}) {
	if(children) {
		return <div aria-busy="true" className={className}>{children}</div>
	}
	return <div aria-busy="true" className={className} />

}

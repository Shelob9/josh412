
export default function Form({
  children,
  className,
  onSubmit
}:{
  children: React.ReactNode,
  className?: string,
  onSubmit: React.FormEventHandler<HTMLFormElement>
}) {
  return <form className={`form${className ? ` ${className}` : ''}`} onSubmit={onSubmit}>
	{children}
  </form>

}

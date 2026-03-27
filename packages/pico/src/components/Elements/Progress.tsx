export default function Progress({
	  value,
  max,
  className
}:{
  value: number,
  max: number,
  className?: string
}) {
  return (
	<progress className={className} value={value} max={max} />
  );
}

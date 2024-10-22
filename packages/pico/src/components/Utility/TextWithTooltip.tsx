
export default function TextWithTooltip({
	text,
  	tooltip,
	className

}:{
  text: string,
  tooltip: string,
  className?: string
}) {
  return (
	<em data-tooltip={tooltip} className={className}>
		{text}
	</em>
  );
}

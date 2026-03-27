import { createElement } from "react";

interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
	children: React.ReactNode;
	as?: keyof JSX.IntrinsicElements;
	fullWidth?: boolean;
}
export default function Container({ children,as ="div",fullWidth, ...props }:ContainerProps) {
  return (
	createElement(as, {
		...props,
		className: `container${fullWidth ? "fluid" : ""}${props.className ? ` ${props.className}` : ""}`,
	}, children)
  );
}

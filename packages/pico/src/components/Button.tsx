import variantClassName, { VariantClasses } from "./Utility/variantClassNames";


function buttonClassName(variant: VariantClasses,className?:string,outline?:boolean) {
	return `button ${variantClassName(variant,className,outline)}`
}
export default function Button({
	variant,
	children,
	outline,
	className,
}:{
	variant?: VariantClasses,
	children: React.ReactNode,
	outline?: boolean,
	className?: string
}) {
	return (
		<button  className={buttonClassName(variant??'default',className,outline)}>
			{children}
		</button>
	);
}

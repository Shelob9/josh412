import variantClassName, { VariantClasses } from "../Utility/variantClassNames"

export default function Submit({
	value,
	variant,
	className,
	outline,
}:{
	value: string,
	variant?: VariantClasses,
	outline?: boolean,
	className?: string
}) {
	return     <input type="submit" value={value} className={variantClassName(variant ?? 'primary',className,outline)} />

}

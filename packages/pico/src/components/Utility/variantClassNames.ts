
export type VariantClasses = 'primary' | 'secondary' | 'contrast'|'default'|'info'|'success'|'warning'|'danger'|'error';

export default function variantClassName(variant: VariantClasses,className?:string,outline?:boolean) {
	return `bg-${variant} ${outline ? ' outline' : ''}${className ? ` ${className} ` : ''}`;
}

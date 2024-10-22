import { ReactNode } from "react";
import variantClassName, { VariantClasses } from "../Utility/variantClassNames";

interface AccordianItem {
	key: string;
	title: ReactNode;
  	content: ReactNode;
  	variant: VariantClasses;
	className?: string;
}
export default function Accordian({items,className}:{
	items: AccordianItem[];
	className?: string;
}){
	return <div className={className}>
		{items.map((item) => (
			<details key={item.key}>
				<summary role="button" className={variantClassName(item.variant,item.className)}>{item.title}</summary>
				<p>{item.content}</p>
			</details>
		))}
	</div>

}

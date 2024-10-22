import { Fragment } from "react/jsx-runtime";

export interface NavItem {
	children: React.ReactNode;
	key: string;
	href?: string;
}

function NavItem({children, href}:Omit<NavItem,'key'>){
	return (
		<li>
			{href ? <a href={href}>{children}</a> : children}
		</li>
	);
}
export default function NavBar({leftItems, rightItems}:{
	leftItems: NavItem[];
	rightItems: NavItem[];
}){
		return (
		  <nav>
			<ul>
			  {leftItems.map((item) => (
				<Fragment key={item.key}><NavItem href={item.href}>{item.children}</NavItem></Fragment>
			  ))}
			</ul>
			<ul>
			  {rightItems.map((item) => (
				<Fragment key={item.key}><NavItem href={item.href}>{item.children}</NavItem></Fragment>
			  ))}
			</ul>
		  </nav>
		)

}

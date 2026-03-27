export default function Dropdown({
	title,
	items,
}:{
	title: string,
	items: {
		value:string;
		label:string;
	}[]
}){
	return (
		<details role="list">
		  <summary aria-haspopup="listbox">{title}</summary>
		  <ul role="listbox">
			{items.map((item) => (
				<li key={item.value} role="option" aria-selected="false">{item.label}</li>
			))}
		  </ul>
		</details>
	  );
}

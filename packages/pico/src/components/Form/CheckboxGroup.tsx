export default function CheckboxGroup({
	legend,
	options,
	onChange,
	value,
}:{
	onChange?: (update:string[]) => void,
	value?: string[],
	legend: string,
	options: {
		name: string,
		label: string,
	}[],
}){
	const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
		if(!onChange){
			return;
		}
		const {checked, name} = event.target;
		if(checked){
			onChange([...(value || []), name]);
		}else{
			onChange((value || []).filter((item) => item !== name));
		}
	}

	return(
		<fieldset>
  			<legend>{legend}</legend>
			{options.map((option) => (
				<label key={option.name}>
					<input
						type="checkbox"
						name={option.name}
						checked={value?.includes(option.name)}
						onChange={changeHandler}
					/>
					{option.label}
				</label>
			))}
		</fieldset>
	)
}

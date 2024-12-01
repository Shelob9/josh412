export default function RadioGroup({
	legend,
	options,
	onChange,
	value,
}:{
	onChange?: (update:string) => void,
	value?: string,
	legend: string,
	options: {
		name: string,
		label: string,
	}[],
}){
	return(
		<fieldset>
  			<legend>{legend}</legend>
			{options.map((option) => (
				<label key={option.name}>
					<input
						type="radio"
						name={option.name}
						checked={value === option.name}
						onChange={onChange ? () => onChange(option.name) : undefined}
					/>
					{option.label}
				</label>
			))}
		</fieldset>
	)
}

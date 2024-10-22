export default function Switch({
	children,
	className,
	onChange,
	isToggled,
	valid,
	disabled,
	readOnly,
	name
}:{
	name: string,
	children: React.ReactNode,
	className?: string,
	onChange: () => void,
	isToggled: boolean,
	valid?: boolean;
	disabled?: boolean;
	readOnly?: boolean;
}) {


	return(
		<label>
			<input

				name={name}
				type="checkbox" role="switch"
				checked={isToggled}
				onChange={onChange}
				className={className}
				aria-invalid={valid !== undefined ? valid : undefined}
				disabled={disabled}
				readOnly={readOnly}

			/>
			{children}
		</label>
	)
}

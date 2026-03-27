import { forwardRef } from "react";

type TextAreaProps = {
  label: string;
  name: string;
  className?: string;
  placeholder?: string;
  description?: string;
  valid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
} & (
  | {
      value: string;
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
      defaultValue?: never;
      ref?: never;
    }
  | {
      defaultValue: string;
      ref: React.Ref<HTMLInputElement>;
      value?: never;
      onChange?: never;
    }
);
const Textarea = forwardRef<HTMLTextAreaElement, TextAreaProps>((props, ref) => {

	if(props.onChange){
		<textarea
			name={props.name}
			id={props.name}
			ref={ref}
			value={props.value}
			onChange={props.onChange}
			aria-invalid={props.valid !== undefined ? props.valid : undefined}
			disabled={props.disabled}
			readOnly={props.readOnly}
			placeholder={props.placeholder}
			aria-label={props.label}
		/>
	}
	return <textarea
		name={props.name}
		id={props.name}
		ref={ref}
		defaultValue={props.defaultValue}
		aria-invalid={props.valid !== undefined ? props.valid : undefined}
		disabled={props.disabled}
		readOnly={props.readOnly}
		placeholder={props.placeholder}
		aria-label={props.label}
	/>
});

export default Textarea;

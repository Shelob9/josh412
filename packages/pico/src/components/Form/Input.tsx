import { forwardRef } from "react";

type InputProps = {
  label: string;
  type: string;
  name: string;
  className?: string;
  description?: string;
  valid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
} & (
  | {
      value: string;
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      defaultValue?: never;
      ref?: never;
    }
  | {
      defaultValue: string;
      ref: React.Ref<HTMLInputElement>;
      onChange?: never;
      value?: never;

    }
);

const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { label, type, name, className,defaultValue, } = props;

  return (
    <div className={`input${className ? ` ${className}` : ''}`}>
      <label htmlFor={name}>{label}</label>
      <>
        {!props.onChange ? <input
            {...props}
            type={type}
            name={name}
            id={name}
            ref={ref}
            defaultValue={defaultValue}
            aria-invalid={props.valid !== undefined ? props.valid : undefined}
            disabled={props.disabled}
            readOnly={props.readOnly}
        />: <input
          {...props}

            type={type}
            name={name}
            id={name}
            ref={ref}
            value={props.value}
            onChange={props.onChange}
            aria-invalid={props.valid !== undefined ? props.valid : undefined}
            disabled={props.disabled}
            readOnly={props.readOnly}
        />}
        {props.description && <small>{props.description}</small>}
      </>
    </div>
  );
});

export default Input;

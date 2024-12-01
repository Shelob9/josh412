import React, { forwardRef } from "react";

type SelectProps = {
  label: string;
  name: string;
  className?: string;
  options: { value: string; label: string }[];
  description?: string;
} & (
  | {
      value: string;
      onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
      defaultValue?: never;
      selectRef?: never;
    }
  | {
      defaultValue: string;
      selectRef: React.Ref<HTMLSelectElement>;
      value?: never;
      onChange?: never;
    }
);

const Select = forwardRef<HTMLSelectElement, SelectProps>((props, ref) => {
  const { label, name, className, options } = props;

  return (
    <div className={`select${className ? ` ${className}` : ''}`}>
      <label htmlFor={name}>{label}</label>
      <select
        name={name}
        id={name}
        ref={props.selectRef || ref}
        value={props.value}
        onChange={props.onChange}
        defaultValue={props.defaultValue}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
	  {props.description && <small>{props.description}</small>}
    </div>
  );
});

export default Select;

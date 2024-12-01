import { render,fireEvent } from '@testing-library/react';

import Input from './Input';
import { vi } from 'vitest';
import { useRef } from 'react';
//test renders matches snapshot
test('renders and matches snapshot', () => {
	const { asFragment } = render(<Input label="test" type="text" name="test" defaultValue='' />);
	expect(asFragment()).toMatchSnapshot();
});
//test valid
test('valid', () => {
	const { getByRole } = render(<Input label="test" type="text" name="test" valid  defaultValue=''/>);
	const input = getByRole('textbox');
	expect(input).toHaveAttribute('aria-invalid', 'true');
});
//test invalid
test('invalid', () => {
	const { getByRole } = render(<Input label="test" type="text" name="test" valid={false}  defaultValue=''/>);
	const input = getByRole('textbox');
	expect(input).toHaveAttribute('aria-invalid', 'false');
});
//test input with onChange and value
test('input with onChange and value', () => {
	const onChange = vi.fn();
	const { getByRole } = render(<Input label="test" type="text" name="test" onChange={onChange} value='' />);
	const input = getByRole('textbox');
	fireEvent.change(input, { target: { value: 'test' } });
	expect(onChange).toHaveBeenCalledWith('test');
});

//test input with ref and defaultValue
test('input with ref and defaultValue', () => {
	const Test = () => {
		const ref =  useRef<HTMLInputElement>(null);
		return <Input label="test" type="text" name="test" ref={ref} defaultValue='' />;
	}
	const { getByRole } = render(<Test />);
	fireEvent.change(getByRole('textbox'), { target: { value: 'test' } });
});

//import Select and render
import { render,fireEvent } from '@testing-library/react';
import Select from './Select';
import { describe, vi } from 'vitest';

describe('Select', () => {
//renders
	it('renders and matches snapshot', () => {
		const { asFragment } = render(<Select
			onChange={vi.fn()}

			label="test" name="test"
			options={[
				{value: "one", label: "One"},
				{value: "test", label: "test"},
				{value: "two", label: "Two"}
			]} />
		);
		expect(asFragment()).toMatchSnapshot();
	});

	it('has value selected', () => {
		const { getByRole } = render(<Select
		onChange={vi.fn()}

			value='two'
			label="test" name="test" options={[
				{value: "one", label: "One"},
				{value: "test", label: "test"},
				{value: "two", label: "Two"}
			]} />);
		const select = getByRole('combobox');
		expect(select).toHaveValue('two');
	});

	//changes
	it('changes', () => {
		const onChange = vi.fn();
		const { getByRole } = render(<Select
			value='two'
			label="test" name="test" options={[
				{value: "one", label: "One"},
				{value: "test", label: "test"},
				{value: "two", label: "Two"}
			]}
			onChange={onChange} />);
		const select = getByRole('combobox');
		fireEvent.change(select, { target: { value: 'test' } });
		expect(onChange).toHaveBeenCalledWith('test');
	});
});

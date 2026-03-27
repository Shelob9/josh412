//test checkbox group, renders, selects and unselects

import { render,fireEvent } from '@testing-library/react';

import CheckboxGroup from './CheckboxGroup';
import { vi } from 'vitest';
describe('CheckboxGroup', () => {

	it('renders and matches snapshot', () => {
		const { asFragment } = render(<CheckboxGroup legend="test" options={[{name: "test", label: "test"}]} />);
		expect(asFragment()).toMatchSnapshot();
	});

	it('selects and unselects', () => {
		const onChange = vi.fn();
		const { getByRole } = render(<CheckboxGroup legend="test" options={[{name: "test", label: "test"}]} onChange={onChange} />);
		const checkbox = getByRole('checkbox');
		fireEvent.click(checkbox);
		expect(onChange).toHaveBeenCalledWith(["test"]);
		fireEvent.click(checkbox);
		expect(onChange).toHaveBeenCalledWith([]);
	});

	it('selects multiple', () => {
		const onChange = vi.fn();
		const { getByRole } = render(<CheckboxGroup legend="test" options={[{name: "test", label: "test"}, {name: "test2", label: "test2"}]} onChange={onChange} />);
		const checkbox = getByRole('checkbox');
		const checkbox2 = getByRole('checkbox', {name: "test2"});
		fireEvent.click(checkbox);
		expect(onChange).toHaveBeenCalledWith(["test"]);
		fireEvent.click(checkbox2);
		expect(onChange).toHaveBeenCalledWith(["test", "test2"]);
	});


});

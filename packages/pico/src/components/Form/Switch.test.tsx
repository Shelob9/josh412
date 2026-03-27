import { render,fireEvent } from '@testing-library/react';
import Switch from './Switch';
import { describe, vi } from 'vitest';


describe('Switch', () => {
	it('Not toggled', () => {
		const { asFragment } = render(
			<Switch
				onChange={vi.fn()}
				isToggled={false}
				name="test"
			>
				Switch
			</Switch>
		);
		expect(asFragment()).toMatchSnapshot();
	});

	//has value selected
	it('toggled', () => {
		const { asFragment } = render(
			<Switch
				onChange={vi.fn()}
				isToggled={true}
				name="test"
			>
				Switch
			</Switch>
		);
		expect(asFragment()).toMatchSnapshot();
	});

	it('toggles on', () => {
		const onChange = vi.fn();
		const { getByRole } = render(
			<Switch
				onChange={onChange}
				isToggled={false}
				name="test"
			>
				Switch
			</Switch>
		);
		const checkbox = getByRole('checkbox');
		fireEvent.click(checkbox);
		expect(onChange).toHaveBeenCalledWith(true);
	});

	it('toggles off', () => {
		const onChange = vi.fn();
		const { getByRole } = render(
			<Switch
				onChange={onChange}
				isToggled={true}
				name="test"
			>
				Switch
			</Switch>
		);
		const checkbox = getByRole('checkbox');
		fireEvent.click(checkbox);
		expect(onChange).toHaveBeenCalledWith(false);
	});
});

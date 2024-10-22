
import { render,fireEvent } from '@testing-library/react';

import RadioGroup from './RadioGroup';
import { vi } from 'vitest';

//renders

test('renders and matches snapshot', () => {
	const { asFragment } = render(<RadioGroup legend="test" options={[{name: "test", label: "test"}]} />);
	expect(asFragment()).toMatchSnapshot();
});
//changes
test('changes', () => {
	const onChange = vi.fn();
	const { getByRole } = render(<RadioGroup legend="test" options={[{name: "test", label: "test"}]} onChange={onChange} />);
	const radio = getByRole('radio');
	fireEvent.click(radio);
	expect(onChange).toHaveBeenCalledWith("test");
});

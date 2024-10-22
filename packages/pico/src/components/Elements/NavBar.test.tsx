import NavBar from "./NavBar";
import {render} from '@testing-library/react';

test('renders and matches snapshot', () => {
	const { asFragment } = render(<NavBar
		leftItems={[
			{key: 'test', children: 'Test'}
		]}
		rightItems={[
			{key: 'test', children: 'About', href: '/about'}
		]}

		/>);
	expect(asFragment()).toMatchSnapshot();
});

import Table from './Table'
import { render } from '@testing-library/react'


test('renders and matches snapshot', () => {
	const { asFragment } = render(<Table
		headers={[
			{label: 'Name', key: 'name'},
			{label: 'Number', key: 'number'}
		]}
		rows={[
			{key: '1', data: {
				name: 'test',
				number: 1
			}},
			{key: '2', data: {
				name: 'test2',
				number: 2
			}},
			{key: '3', data: {
				name: 'test3',
				number: 3
			}}
		]}
	/>);
	expect(asFragment()).toMatchSnapshot();
});

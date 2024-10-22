import Accordian from "./Accordian";


import { render } from "@testing-library/react";

test("renders and matches snapshot", () => {
	const { asFragment } = render(<Accordian
		items={[
			{key: 'test', title: 'Test', content: 'Test content',variant: 'primary'},
			{key:'test2', title: 'Test2', content: <div>
				<p>One</p>
				<p>Two</p>
			</div>, variant: 'secondary'}


		]}
		/>
	);
	expect(asFragment()).toMatchSnapshot();
});

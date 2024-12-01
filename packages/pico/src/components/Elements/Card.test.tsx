import Card from "./Card";


import { render } from "@testing-library/react";

test("renders and matches snapshot", () => {
	const { asFragment } = render(<Card
		title="test"
		footer="footer"
		>
			<p>Words tacos, words</p>
		</Card>
	);
	expect(asFragment()).toMatchSnapshot();
});

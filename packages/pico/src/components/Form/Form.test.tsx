import { render } from "@testing-library/react";
import {vi} from "vitest";
import Form from "./Form";

//test form renders with snapshot
test('form renders with snapshot', () => {
  const { asFragment } = render(
	<Form onSubmit={vi.fn()}>
	  <input type="text" />
	</Form>
  );
  expect(asFragment()).toMatchSnapshot();
});

import { describe, test } from "vitest";
import Progress from "./Progress";
import { render } from '@testing-library/react'


describe('Progress', () => {
  test('with progress', () => {
    const {asFragment} = render(<Progress value={50} max={100} />);
    expect(asFragment()).toMatchSnapshot();
  })
  test('without progress', () => {
    const {asFragment} = render(<Progress value={0} max={100} />);
    expect(asFragment()).toMatchSnapshot();
  })
});

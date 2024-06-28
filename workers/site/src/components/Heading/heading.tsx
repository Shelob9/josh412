

import { Fragment } from "react";
import { Button } from 'react-daisyui';
import CreateClipping from "../Clippings/Create";
import ListClippings from "../Clippings/List";
function Heading() {
  return (
    <Fragment>
      <h1 className="text-3xl font-bold underline">
            App</h1>
            <Button>Click</Button>
      <div>
        <section>
          <CreateClipping />
          <ListClippings />
        </section>
      </div>
    </Fragment>
  );
}

export default Heading;

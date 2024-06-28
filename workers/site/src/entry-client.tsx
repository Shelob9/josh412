

import Application from "@app/app";
import React from "react";
import ReactDOM from "react-dom/client";

function Client() {
  return (
    <React.StrictMode>
      <Application />
    </React.StrictMode>
  );
}

ReactDOM.hydrateRoot(document!, <Client />);

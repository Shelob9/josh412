import { HTMLAttributes } from "react";

const Main = (props: HTMLAttributes<HTMLElement>) => {
  return (
    <main className="container" {...props}>
      {props.children}
    </main>
  );
};

export default Main;

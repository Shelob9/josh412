import { HTMLAttributes } from "react";

const Header = (props: HTMLAttributes<HTMLElement>) => {
  return (
    <header className="container" {...props}>
      {props.children}
    </header>
  );
};

export default Header;

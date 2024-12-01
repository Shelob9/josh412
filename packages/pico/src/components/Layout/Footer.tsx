import { HTMLAttributes } from "react";

const Footer = (props: HTMLAttributes<HTMLElement>) => {
  return (
    <footer className="container" {...props}>
      {props.children}
    </footer>
  );
};

export default Footer;

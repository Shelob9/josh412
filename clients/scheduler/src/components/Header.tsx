import { ReactNode } from "react";

type Header_Button_Props = {
    children: ReactNode;
    onClick?: () => void;
  };

  const primaryBtnClasses = () => `ml-3 inline-flex items-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500`;
  const secondaryBtnClasses = () => `inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold hover:text-white text-black border-gray hover:border-white border-2 shadow-sm hover:bg-white/20`;
  const HeaderButton = ({ children, onClick,isPrimary }: Header_Button_Props & {isPrimary:boolean}) => (
    <button
          onClick={onClick}
            type="button"
            className={isPrimary ? primaryBtnClasses() : secondaryBtnClasses()}
          >
            {children}
      </button>
  );
  export default function Header({
    title,
    titleLink,
    buttonOne,
    buttonTwo,
  }: {
    title: string;
    titleLink?: string;
    buttonOne?: Header_Button_Props;
    buttonTwo?: Header_Button_Props;
  }) {
    return (
      <div className="md:flex md:items-center md:justify-between bg-black p-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
            {titleLink ? <a href={titleLink}>{title}</a> : <>{title}</>}
          </h2>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          {buttonOne ? <HeaderButton {...buttonOne } isPrimary={false} /> : null}
          {buttonTwo ? <HeaderButton {...buttonTwo } isPrimary={true} /> : null}
        </div>
      </div>
    );
  }

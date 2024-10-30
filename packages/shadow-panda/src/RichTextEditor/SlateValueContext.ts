import { Descendant } from "slate";
import { createContext } from "react";

export const SlateValueContext = createContext<{
    slateValue: Descendant[];
    setSlateValue: (value: Descendant[]) => void;
}>({
    slateValue: [],
    // @ts-ignore
    setSlateValue: (value: Descendant[]) => {},
});

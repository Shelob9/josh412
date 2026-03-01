import * as React from "react";
import { styled } from "@shadow-panda/styled-system/jsx";
import {
    alert,
    alertTitle,
    alertDescription,
} from "@shadow-panda/styled-system/recipes";

import { AlertCircle, AlertOctagon } from "lucide-react";

export type AlertArgs = {
    title: string;
    content: string;
};
export function AlertError({ title, content }: AlertArgs) {
    return (
        <Alert variant="destructive">
            <AlertOctagon />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>{content}</AlertDescription>
        </Alert>
    );
}

export function AlertSucces({ title, content }: AlertArgs) {
    return (
        <Alert variant="default">
            <AlertCircle />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>{content}</AlertDescription>
        </Alert>
    );
}
const BaseAlert = (
    props: React.HTMLAttributes<HTMLDivElement>,
    ref: React.ForwardedRef<HTMLDivElement>,
) => <div ref={ref} {...props} role="alert" />;

export const Alert = styled(
    React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
        BaseAlert,
    ),
    alert,
);
export const AlertTitle = styled("h5", alertTitle);
export const AlertDescription = styled("div", alertDescription);

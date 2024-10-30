import { ReactNode, useCallback, useContext, useEffect, useMemo } from "react";
import { Editable, withReact, Slate } from "slate-react";
import { withHistory } from "slate-history";
import { createEditor, Descendant } from "slate";

import { SlateValueContext } from "./SlateValueContext";
import { Toolbar } from "./Toolbar";
import { GeneralElement, RichTextFormat } from "./types";
import { findUrlsInText, toggleMark } from "./util";
import { css } from "@shadow-panda/styled-system/css";

//@ts-ignore
const myDecorator = ([node, path]) => {
    console.log({
        node,
        path,
    });
    const nodeText = node.text;

    if (!nodeText) return [];

    const urls = findUrlsInText(nodeText);

    return urls.map(([url, index]) => {
        return {
            anchor: {
                path,
                offset: index,
            },
            focus: {
                path,
                offset: index + url.length,
            },
            decoration: "link",
        };
    });
};
interface IRichTextEditor {
    initialValue: Descendant[];
    dynamicValue?: Descendant[];
    onSave: (value: Descendant[]) => void;
}

const RichTextEditor = ({
    initialValue = [],
    dynamicValue = [],
    onSave,
}: IRichTextEditor) => {
    const renderElement = useCallback(
        //@ts-ignore
        (props: any) => <Element {...props} />,
        [],
    );
    const renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);
    const editor = useMemo(() => withHistory(withReact(createEditor())), []);
    const onToggleFormat = useCallback(
        (format: RichTextFormat) => {
            toggleMark(editor, format);
        },
        [editor],
    );
    const { setSlateValue } = useContext(SlateValueContext);
    useEffect(() => {
        //@ts-ignore
        setSlateValue(JSON.stringify(initialValue));
    }, [initialValue, setSlateValue]);

    if (dynamicValue.length > 0) {
        editor.children = dynamicValue;
    }

    useEffect(() => {
        const content = JSON.stringify(editor.children);
        //@ts-ignore

        setSlateValue(content);
    }, [editor.children, setSlateValue]);

    return (
        <Slate
            editor={editor}
            initialValue={initialValue}
            onChange={(value) => {
                const isAstChange = editor.operations.some(
                    (op) => "set_selection" !== op.type,
                );
                if (isAstChange) {
                    // Save the value to Local Storage.
                    const content = JSON.stringify(value);

                    console.log(editor.children);
                    setSlateValue(content);
                }
            }}
        >
            <Toolbar
                onClickFormat={onToggleFormat}
                onRedo={() => editor.redo()}
                onSave={() => onSave(editor.children)}
                onUndo={() => editor.undo()}
            />
            <Editable
                decorate={myDecorator}
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                placeholder="Enter some rich text…"
                spellCheck
                autoFocus
            />
        </Slate>
    );
};

const Element = ({
    attributes,
    children,
    element,
}: {
    //@ts-ignore
    attributes: any;
    children: ReactNode;
    element: GeneralElement;
}) => {
    const style = { textAlign: element.align };
    switch (element.type) {
        case "paragraph":
            return (
                <p style={style} {...attributes}>
                    {children}
                </p>
            );
        case "block-quote":
            return (
                <blockquote style={style} {...attributes}>
                    {children}
                </blockquote>
            );
        case "bulleted-list":
            return (
                <ul style={style} {...attributes}>
                    {children}
                </ul>
            );
        case "h1":
            return (
                <h1 style={style} {...attributes}>
                    {children}
                </h1>
            );
        case "h2":
            return (
                <h2 style={style} {...attributes}>
                    {children}
                </h2>
            );
        case "list-item":
            return (
                <li style={style} {...attributes}>
                    {children}
                </li>
            );
        case "numbered-list":
            return (
                <ol style={style} {...attributes}>
                    {children}
                </ol>
            );
        default:
            return (
                <p style={style} {...attributes}>
                    {children}
                </p>
            );
    }
};

const A = ({ href, children }: { href: string; children: ReactNode }) => (
    <a
        className={css({
            cursor: "pointer",
            textDecoration: "underline",
            borderBottom: "1px solid blue",
        })}
        href={href}
        target="_blank"
        rel="noreferrer noopener"
    >
        {children}
    </a>
);

const Leaf = ({
    attributes,
    children,
    leaf,
}: {
    attributes: any;
    children: ReactNode;
    leaf: any;
}) => {
    if (leaf.decoration === "link") {
        children = <A href={leaf.text}>{children}</A>;
    }
    if (leaf.bold) {
        children = <strong>{children}</strong>;
    }

    if (leaf.code) {
        children = <code>{children}</code>;
    }

    if (leaf.italic) {
        children = <em>{children}</em>;
    }

    if (leaf.underline) {
        children = <u>{children}</u>;
    }

    return <span {...attributes}>{children}</span>;
};

export default RichTextEditor;

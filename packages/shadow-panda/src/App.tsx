import { css } from "@shadow-panda/styled-system/css";
import Taco from "@ui/Taco";
import { slateToHtml } from "@slate-serializers/html";
import { Descendant } from "slate";

const initialValue: Descendant[] = [
    {
        type: "paragraph",
        children: [
            { text: "This is editable " },
            { text: "rich", bold: true },
            { text: " text, " },
            { text: "much", italic: true },
            { text: " better than a " },
            { text: "<textarea>", code: true },
            { text: "!" },
        ],
    },
    {
        type: "paragraph",
        children: [{ text: "https://taco.com" }],
    },
    {
        type: "paragraph",
        children: [
            {
                text: "Since it's rich text, you can do things like turn a selection of text ",
            },
            { text: "bold", bold: true },
            {
                text: ", or add a semantically rendered block quote in the middle of the page, like this:",
            },
        ],
    },
    {
        type: "block-quote",
        children: [{ text: "A wise quote." }],
    },
    {
        type: "paragraph",
        align: "center",
        children: [{ text: "Try it out for yourself!" }],
    },
];

import RichTextEditor from "./RichTextEditor/Editor";
import { useState } from "react";
import { Separator } from "@radix-ui/react-separator";
import { Container } from "@shadow-panda/styled-system/jsx";
import TableDemo from "@ui/DataTable/TableDemo";
function App() {
    const [html, setHtml] = useState("");
    return (
        <Container>
            <Container>
                <RichTextEditor
                    initialValue={initialValue}
                    onSave={(value) => {
                        console.log(value);
                        setHtml(slateToHtml(value));
                    }}
                />
            </Container>
            <Taco />
            <Separator
                className={css({
                    width: "100%",
                    height: "2px",
                })}
            />
            <Container dangerouslySetInnerHTML={{ __html: html }}></Container>
            <TableDemo />
        </Container>
    );
}
export default App;

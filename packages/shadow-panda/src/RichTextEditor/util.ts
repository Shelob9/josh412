import { Editor } from "slate";
export const isMarkActive = (
    editor: Editor,
    format: "bold" | "italic" | "underline" | "del",
) => {
    const marks = Editor.marks(editor);
    // @ts-ignore
    return marks ? marks[format] === true : false;
};

export const toggleMark = (
    editor: Editor,
    format: "bold" | "italic" | "underline" | "del",
) => {
    const isActive = isMarkActive(editor, format);

    if (isActive) {
        Editor.removeMark(editor, format);
    } else {
        Editor.addMark(editor, format, true);
    }
};

export const findUrlsInText = (text: string) => {
    const urlRegex =
        // eslint-disable-next-line no-useless-escape
        /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim;

    const matches = text.match(urlRegex);

    return matches
        ? matches.map((m) => [m.trim(), text.indexOf(m.trim())])
        : [];
};

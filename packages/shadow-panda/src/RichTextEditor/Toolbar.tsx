import { Separator } from "../ui/Seperator";
import {
    BoldIcon,
    ItalicIcon,
    RedoIcon,
    StrikethroughIcon,
    UnderlineIcon,
    UndoIcon,
} from "lucide-react";
import { Button } from "../ui/Button";
import { RichTextFormat } from "./types";

import { HStack } from "@shadow-panda/styled-system/jsx";

export function Toolbar({
    onClickFormat,
    onUndo,
    onRedo,
    onSave,
}: {
    onClickFormat: (format: RichTextFormat) => void;
    onUndo: () => void;
    onRedo: () => void;
    onSave: () => void;
}) {
    return (
        <HStack alignSelf={"center"} alignItems={"center"} display={"flex"}>
            <BoldIcon
                onClick={() => onClickFormat("bold")}
                size={24}
                className="bg-success"
            />
            <UnderlineIcon onClick={() => onClickFormat("underline")} />
            <StrikethroughIcon onClick={() => onClickFormat("del")} />
            <ItalicIcon onClick={() => onClickFormat("italic")} />
            <Separator orientation="vertical" />
            <UndoIcon onClick={onUndo} />
            <RedoIcon onClick={onRedo} />
            <Separator orientation="vertical" />
            <Button variant={"outline"} onClick={onSave}>
                Save
            </Button>
        </HStack>
    );
}

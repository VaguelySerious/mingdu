import { MessageType } from "@/lib/store";
import { Markdown } from "./markdown";

export const Word = ({
  // id,
  // role,
  word,
  withDictLookup = true,
  withMarkdown = false,
}: {
  id: string;
  role: MessageType["role"];
  word: string;
  withDictLookup?: boolean;
  withMarkdown?: boolean;
}) => {
  if (withMarkdown) {
    return <Markdown>{word}</Markdown>;
  }
  if (withDictLookup) {
    // TODO
    return <span className="ml-1 whitespace-nowrap">{word}</span>;
  }
  return <span className="ml-1 whitespace-nowrap">{word}</span>;
};

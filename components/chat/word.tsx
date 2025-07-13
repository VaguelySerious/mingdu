import { MessageType } from "@/lib/store";
// import { Markdown } from "./markdown";

export const Word = ({
  // id,
  // role,
  word,
}: {
  id: string;
  role: MessageType["role"];
  word: string;
}) => {
  return <span className="whitespace-nowrap">{word}</span>;
  // return <Markdown>{word}</Markdown>;
};

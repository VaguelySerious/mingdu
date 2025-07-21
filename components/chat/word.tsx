import { MessageType } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { DictionaryEntry } from "./dictionary-entry";
import { Markdown } from "./markdown";

const color_examples: Record<string, string> = {
  独轮车: "text-red-500",
  电动: "text-orange-500",
  铭读: "text-orange-500",
  一般: "text-yellow-500",
};

export const Word = ({
  id,
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
  const wordContent = (
    <span className={cn("ml-1 whitespace-nowrap", color_examples[word])}>
      {word}
    </span>
  );

  if (withMarkdown) {
    return <Markdown>{word}</Markdown>;
  }
  if (withDictLookup) {
    return (
      <Tooltip>
        <TooltipTrigger>{wordContent}</TooltipTrigger>
        <TooltipContent>
          {/* TODO: Make this a nicer loading state, like a skeleton of a two-char Mandarin word */}
          <Suspense fallback={<div>...</div>}>
            <DictionaryEntry id={id} word={word} />
          </Suspense>
        </TooltipContent>
      </Tooltip>
    );
  }
  return wordContent;
};

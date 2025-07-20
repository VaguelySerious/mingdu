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
  // id,
  // role,
  word,
  withDictLookup = false,
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
    return (
      <Tooltip>
        <TooltipTrigger>
          <span className="ml-1 whitespace-nowrap">{word}</span>
        </TooltipTrigger>
        <TooltipContent>
          {/* TODO: Make this a nicer loading state, like a skeleton of a two-char Mandarin word */}
          <Suspense fallback={<div>...</div>}>
            <DictionaryEntry word={word} />
          </Suspense>
        </TooltipContent>
      </Tooltip>
    );
  }
  return (
    <span className={cn("ml-1 whitespace-nowrap", color_examples[word])}>
      {word}
    </span>
  );
};

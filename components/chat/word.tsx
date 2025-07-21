import { MessageType } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import { Spinner } from "../ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { DictionaryEntry } from "./dictionary-entry";
import { Markdown } from "./markdown";

const chineseRegex = /[\u4E00-\u9FFF]/;
// const japaneseRegex = /[\u3040-\u30FF\u31F0-\u31FF\uFF00-\uFFEF]/;
// const koreanRegex = /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF]/;

const color_examples: Record<string, string> = {
  独轮车: "text-red-500",
  电动: "text-orange-500",
  铭读: "text-orange-500",
  一般: "text-yellow-500",
};

export const Word = ({
  id,
  word,
  // withDictLookup = true,
  withMarkdown = false,
}: {
  id: string;
  role: MessageType["role"];
  word: string;
  // withDictLookup?: boolean;
  withMarkdown?: boolean;
}) => {
  const wordContent = (
    <span className={cn("ml-1 whitespace-nowrap", color_examples[word])}>
      {word}
    </span>
  );

  // Only lookup dictionary if word contains Chinese characters
  const shouldLookupDict = chineseRegex.test(word);

  if (withMarkdown) {
    return <Markdown>{word}</Markdown>;
  }
  if (shouldLookupDict) {
    return (
      <Tooltip>
        <TooltipTrigger>{wordContent}</TooltipTrigger>
        <TooltipContent
          className="min-w-42"
          sideOffset={8}
          collisionPadding={20}
        >
          <Suspense
            fallback={
              <div className="flex w-full h-16 items-center justify-center">
                <Spinner className="text-black" />
              </div>
            }
          >
            <DictionaryEntry id={id} word={word} />
          </Suspense>
        </TooltipContent>
      </Tooltip>
    );
  }
  return wordContent;
};

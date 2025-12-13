import { MessageType } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import { SKILL_LEVELS_TO_COLORS } from "../skill/constants";
import { useSkillLevel } from "../skill/use-skill";
import { Spinner } from "../ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { DictionaryEntry } from "./dictionary-entry";
import { Markdown } from "./markdown";

const chineseRegex = /[\u4E00-\u9FFF]/;
// const japaneseRegex = /[\u3040-\u30FF\u31F0-\u31FF\uFF00-\uFFEF]/;
// const koreanRegex = /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF]/;

export const Word = ({
  id,
  word,
  // withDictLookup = true,
  withMarkdown = false,
  className,
}: {
  id: string;
  role: MessageType["role"];
  word: string;
  className?: string;
  // withDictLookup?: boolean;
  withMarkdown?: boolean;
}) => {
  const { level } = useSkillLevel(word);

  // TODO: Left-off
  // For one, we color items that aren't actually in the dictionary.
  // We should generally only allow skill measurement for words in the dictionary.
  // This might require pre-initializing the levels for each dictionary item,
  // in the same code that initializes the HSK levels on init,
  // and then do not color or do anything if the item can't be found in the skill
  // list.

  // TODO: Secondly, rehydrating zustand doesn't correctly set the "hydrated" flag.
  // I removed this and instead check a predefined word for its level in the store,
  // but not sure if that triggers correctly.

  const textColor =
    level !== undefined ? SKILL_LEVELS_TO_COLORS[level] : undefined;
  const wordContent = (
    <span className={cn("ml-1 whitespace-nowrap", className, textColor)}>
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

import type { CorrectionType } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Word } from "./word";

const DefaultSpan = ({
  words,
  messageKey,
  className,
}: {
  words: string[];
  messageKey: string;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-wrap", className)}>
      {words.map((word, i) => {
        const wordKey = `${messageKey}-word-${i}`;
        return <Word role="user" id={wordKey} key={wordKey} word={word} />;
      })}
    </div>
  );
};

const CorrectionSpan = ({
  words,
  messageKey,
  correction,
}: {
  words: string[];
  messageKey: string;
  correction: CorrectionType["items"][number];
}) => {
  return (
    <Tooltip>
      <TooltipTrigger>
        <DefaultSpan
          words={words}
          messageKey={messageKey}
          className="p-1 flex flex-wrap border-b-2 border-pink-500 cursor-pointer"
        />
      </TooltipTrigger>
      <TooltipContent sideOffset={8}>
        <div className="max-w-xs text-xs">
          <div className="font-bold mb-1 text-green-600">
            修正: {correction.correction}
          </div>
          <div className="text-white">{correction.explanation}</div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export const WordSpan = ({
  words,
  messageKey,
  correction,
}: {
  words: string[];
  messageKey: string;
  correction?: CorrectionType["items"][number];
}) => {
  if (correction) {
    return (
      <CorrectionSpan
        words={words}
        messageKey={messageKey}
        correction={correction}
      />
    );
  }
  return <DefaultSpan words={words} messageKey={messageKey} />;
};

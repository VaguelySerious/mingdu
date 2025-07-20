import type { CorrectionType } from "@/lib/store";
import { cn } from "@/lib/utils";
import { InfoIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Word } from "./word";

const DefaultSpan = ({
  words,
  messageKey,
  isCorrection,
  className,
}: {
  words: string[];
  messageKey: string;
  className?: string;
  isCorrection?: boolean;
}) => {
  return (
    <div
      className={cn(
        "text-xl flex flex-wrap",
        isCorrection ? "cursor-pointer" : "pb-1",
        className
      )}
    >
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
      <div className="flex flex-col gap-1">
        <DefaultSpan
          isCorrection
          className="border-b-2 border-red-500 pb-1"
          words={words}
          messageKey={messageKey}
        />
        <span className="flex items-center gap-2">
          <DefaultSpan
            isCorrection
            className="text-red-800"
            words={[correction.correction]}
            messageKey={`${messageKey}-correction`}
          />
          <TooltipTrigger>
            <InfoIcon className="w-4 h-4 text-red-500" />
          </TooltipTrigger>
          <TooltipContent sideOffset={8}>
            <div className="text-white text-xl">{correction.explanation}</div>
          </TooltipContent>
        </span>
      </div>
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

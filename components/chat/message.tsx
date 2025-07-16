"use client";

import { AnimatePresence, motion } from "motion/react";
import { memo } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { wordsAndCorrectionsToSpans } from "@/lib/arrayspan";
import type { CorrectionType } from "@/lib/store";
import { useChatStore } from "@/lib/store";
import { QueryStatusType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SparklesIcon } from "lucide-react";
import { SpinnerIcon } from "../icons";
import { Word } from "./word";

const Spinner = () => (
  <div className="flex flex-row gap-2 items-center">
    <div className="font-medium text-sm">Thinking...</div>
    <div className="animate-spin">
      <SpinnerIcon />
    </div>
  </div>
);

const WordSpan = ({
  words,
  messageKey,
  className,
}: {
  words: string[];
  messageKey: string;
  className?: string;
}) => {
  return (
    <span className={cn("flex w-full flex-wrap", className)}>
      {words.map((word, i) => {
        const wordKey = `${messageKey}-word-${i}`;
        return <Word role="user" id={wordKey} key={wordKey} word={word} />;
      })}
    </span>
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
      <TooltipTrigger asChild>
        <WordSpan
          words={words}
          messageKey={messageKey}
          className="p-1 flex w-full flex-wrap border-b-2 border-pink-500 cursor-pointer"
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

const PurePreviewMessage = ({
  id,
  isLatestMessage,
  queryStatus,
}: {
  id: string;
  queryStatus: QueryStatusType;
  isLatestMessage: boolean;
}) => {
  const { error, role, words } = useChatStore((state) => state.messages[id]);
  const messageKey = `message-${id}`;
  const loadingStates = ["streaming", "submitted"] as QueryStatusType[];
  const shouldShowLoading =
    isLatestMessage && loadingStates.includes(queryStatus);

  const correction = useChatStore((state) =>
    Object.values(state.corrections).find((c) => c.messageId === id)
  );
  const correctionItems = correction?.items ?? [];

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const spans = wordsAndCorrectionsToSpans(words, correctionItems);

  return (
    <AnimatePresence key={messageKey}>
      <motion.div
        className="w-full mx-auto px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        key={`message-${id}`}
        data-role={role}
      >
        <div
          className={cn(
            "flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl",
            "group-data-[role=user]/message:w-fit"
          )}
        >
          {role === "assistant" && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
              <div className="">
                <SparklesIcon size={14} />
              </div>
            </div>
          )}

          <motion.div
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-row gap-2 items-start w-full pb-4"
          >
            <div
              id={id}
              className={cn("flex flex-col gap-4", {
                "bg-secondary text-secondary-foreground px-3 py-2 rounded-tl-xl rounded-tr-xl rounded-bl-xl":
                  role === "user",
              })}
            >
              {spans.map((span, i) =>
                span.correction ? (
                  <CorrectionSpan
                    key={`${messageKey}-span-${i}`}
                    words={span.words}
                    messageKey={`${messageKey}-span-${i}`}
                    correction={span.correction}
                  />
                ) : (
                  <WordSpan
                    key={`${messageKey}-span-${i}`}
                    words={span.words}
                    messageKey={`${messageKey}-span-${i}`}
                  />
                )
              )}
            </div>
          </motion.div>

          {shouldShowLoading && <Spinner />}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const Message = memo(PurePreviewMessage, (prevProps, nextProps) => {
  if (prevProps.queryStatus !== nextProps.queryStatus) return false;
  if (prevProps.id !== nextProps.id) return false;
  if (prevProps.isLatestMessage !== nextProps.isLatestMessage) return false;
  return true;
});

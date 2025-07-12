"use client";

import { AnimatePresence, motion } from "motion/react";
import { memo } from "react";

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

const PurePreviewMessage = ({
  id,
  isLatestMessage,
  queryStatus,
}: {
  id: string;
  queryStatus: QueryStatusType;
  isLatestMessage: boolean;
}) => {
  const { role, words } = useChatStore((state) => state.messages[id]);
  const messageId = `message-${id}`;
  const loadingStates = ["streaming", "submitted"] as QueryStatusType[];
  const shouldShowLoading =
    isLatestMessage && loadingStates.includes(queryStatus);
  return (
    <AnimatePresence key={messageId}>
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
              <div className="flex w-full space-y-4">
                {words.map((word, i) => {
                  const wordId = `${messageId}-word-${i}`;
                  return (
                    <Word key={wordId} id={wordId} role={role} word={word} />
                  );
                })}
              </div>
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

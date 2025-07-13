"use client";

import { useScrollToBottom } from "@/lib/hooks/use-scroll-to-bottom";
import { QueryStatusType } from "@/lib/types";
import { Message } from "./message";

export const Messages = ({
  messageIds,
  queryStatus,
}: {
  messageIds: string[];
  queryStatus: QueryStatusType;
}) => {
  const [containerRef, endRef] = useScrollToBottom();
  return (
    <div
      className="flex-1 h-full space-y-4 overflow-y-auto py-8"
      ref={containerRef}
    >
      <div className="max-w-xl mx-auto pt-8">
        {messageIds.map((id) => (
          <Message
            key={id}
            id={id}
            isLatestMessage={id === messageIds[messageIds.length - 1]}
            queryStatus={queryStatus}
          />
        ))}
        <div className="h-1" ref={endRef} />
      </div>
    </div>
  );
};

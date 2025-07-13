"use client";

import { chatTextRequest } from "@/ai/chat-free";
import { sendSignal, SIGNAL_TOPICS } from "@/lib/hooks/use-signals";
import { MessageType, useChatStore } from "@/lib/store";
import { QueryStatusType } from "@/lib/types";
import { CoreMessage as APIMessageType, generateId } from "ai";
import { useCallback, useEffect, useState } from "react";
import { InitialScreen } from "../help/initial-screen";
import { Messages } from "./messages";
import { Textarea } from "./textarea";

export default function Chat({ conversationId }: { conversationId: string }) {
  const selectedModelId = useChatStore((state) => state.selectedModelId);

  const messageIds = useChatStore(
    (state) => state.conversations[conversationId]?.messageIds ?? []
  );
  const [input, setInput] = useState("");
  const messageCount = messageIds.length;
  const [queryStatus, setQueryStatus] = useState<QueryStatusType>("ready");

  useEffect(() => {
    if (messageCount === 0) {
      setInput("你怎么样？");
    }
  }, [messageCount]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      console.debug("handleSubmit");
      setInput("");

      const state = useChatStore.getState();
      const allMessages = useChatStore.getState().messages;
      const messages = messageIds.map((id) => allMessages[id]).filter(Boolean);
      const now = new Date().getTime();

      const userMessage: MessageType = {
        id: generateId(),
        role: "user",
        // TODO: split words using AI query later
        words: input.split(""),
        createdAt: now,
      };
      state.addMessage(conversationId, userMessage);

      // TODO Start separate async process that replaces user message with word-split message

      const assistantMessage: MessageType = {
        id: generateId(),
        role: "assistant",
        words: [],
        createdAt: now + 1,
        isLoading: true,
      };
      state.addMessage(conversationId, assistantMessage);

      const promptMessages: APIMessageType[] = [...messages, userMessage].map(
        (message) => ({
          role: message.role,
          content: message.words.join(""),
        })
      );

      const onWord = (word: string) => {
        setQueryStatus("streaming");
        state.addWordToMessage(assistantMessage.id, word as string);
      };

      try {
        setQueryStatus("submitted");
        await chatTextRequest(selectedModelId, promptMessages, onWord);
        setQueryStatus("ready");
        sendSignal(SIGNAL_TOPICS.MESSAGE_COMPLETED, {
          messageId: assistantMessage.id,
          conversationId,
        });
      } catch (e: unknown) {
        let message: string = "Unknown error";
        if (e instanceof Error) {
          message = e.message;
        } else if (typeof e === "string") {
          message = e;
        } else if (
          e &&
          typeof e === "object" &&
          "error" in e &&
          e.error instanceof Error
        ) {
          message = e.error.message;
        }
        state.updateMessage(assistantMessage.id, { error: message });
        console.debug(e);
        setQueryStatus("error");
      }
    },
    [selectedModelId, conversationId, input, setQueryStatus, messageIds]
  );

  return (
    <div className="flex-1 flex flex-col justify-center" key={conversationId}>
      <div className="flex items-center justify-center"></div>
      {messageIds.length === 0 ? (
        <div className="max-w-xl mx-auto w-full">
          <InitialScreen />
        </div>
      ) : (
        <Messages messageIds={messageIds} queryStatus={queryStatus} />
      )}
      <form
        onSubmit={handleSubmit}
        className="pb-8 bg-white dark:bg-black w-full max-w-xl mx-auto px-4 sm:px-0"
      >
        <Textarea
          handleInputChange={(e) => setInput(e.target.value)}
          input={input}
          queryStatus={queryStatus}
          stop={stop}
        />
      </form>
      <div className="max-w-xl mx-auto w-full">Status: {queryStatus}</div>
    </div>
  );
}

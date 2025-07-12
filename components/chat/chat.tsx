"use client";

import { CHAT_SYSTEM_PROMPT } from "@/ai/prompts";
import { sendSignal, SIGNAL_TOPICS } from "@/lib/hooks/use-signals";
import {
  getOpenAIKey,
  getOpenAIProvider,
  promptForOpenAIKey,
} from "@/lib/keymanager";
import { MessageType, useChatStore } from "@/lib/store";
import { QueryStatusType } from "@/lib/types";
import { CoreMessage as APIMessageType, generateId, streamObject } from "ai";
import { useCallback, useEffect, useState } from "react";
import z from "zod";
import { InitialScreen } from "../help/initial-screen";
import { Messages } from "./messages";
import { Textarea } from "./textarea";

export default function Chat({ conversationId }: { conversationId: string }) {
  const selectedModelId = useChatStore((state) => state.selectedModelId);
  const [keyLoaded, setKeyLoaded] = useState(getOpenAIKey());

  const messageIds = useChatStore(
    (state) => state.conversations[conversationId]?.messageIds ?? []
  );
  const [input, setInput] = useState(
    messageIds.length === 0 ? "你怎么样？" : ""
  );
  const [queryStatus, setQueryStatus] = useState<QueryStatusType>("ready");

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setQueryStatus("submitted");
      console.debug("handleSubmit");

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

      const { elementStream: wordStream } = streamObject({
        model: getOpenAIProvider(selectedModelId),
        output: "array",
        schema: z.string().describe("List of words"),
        schemaDescription: "List of words or special characters in Mandarin",
        system: CHAT_SYSTEM_PROMPT,
        messages: promptMessages,
        onError: (error) => {
          // TODO: Better error handling
          console.error(error);
          setQueryStatus("error");
        },
        onFinish: () => {
          setQueryStatus("ready");
          sendSignal(SIGNAL_TOPICS.MESSAGE_COMPLETED, {
            messageId: assistantMessage.id,
            conversationId,
          });
        },
      });

      console.debug("wordStream created");

      for await (const word of wordStream) {
        setQueryStatus("streaming");
        state.addWordToMessage(assistantMessage.id, word as string);
      }
    },
    [selectedModelId, conversationId, input, setQueryStatus, messageIds]
  );

  useEffect(() => {
    if (!keyLoaded) {
      const key = promptForOpenAIKey();
      if (key) {
        setKeyLoaded(key);
      }
    }
  }, [keyLoaded]);

  if (!keyLoaded) {
    return (
      <main className="flex-1">
        <div className="flex justify-center items-center h-full">
          <div className="text-2xl font-bold">Loading...</div>
        </div>
      </main>
    );
  }

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

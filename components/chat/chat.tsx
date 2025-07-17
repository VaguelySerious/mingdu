"use client";

import { chatTextRequest } from "@/ai/chat";
import { correctionJsonRequest } from "@/ai/correction-json";
import { recipeRequest } from "@/ai/recipe";
import { splitTextRequest } from "@/ai/split";
import { Button } from "@/components/ui/button";
import { sendSignal, SIGNAL_TOPICS } from "@/lib/hooks/use-signals";
import { CorrectionType, MessageType, useChatStore } from "@/lib/store";
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
      setInput(
        "你好！我叫马克。我刚刚的爱好是去公园骑一个电动独轮车。你知道那是什么吗？"
      );
      // setInput("你怎么样？");
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
        words: [input],
        createdAt: now,
      };
      state.addMessage(conversationId, userMessage);

      // In parallel, make a request to split the user message into words
      splitTextRequest(selectedModelId, input)
        .then((words) => {
          userMessage.words = words;
          state.updateMessage(userMessage.id, userMessage);
        })
        .catch((e) => {
          console.error("Unable to split text, error:", e);
        });

      // In parallel, make a request to correct the user message
      const correction: CorrectionType = {
        id: generateId(),
        messageId: userMessage.id,
        items: [],
        createdAt: now,
        isLoading: true,
      };
      state.addCorrection(correction);
      correctionJsonRequest(selectedModelId, input, (correctionItem) => {
        console.debug(correctionItem);
        state.addCorrectionItem(correction.id, correctionItem);
      })
        .then(() => {
          state.updateCorrection(correction.id, {
            isLoading: false,
          });
        })
        .catch((e) => {
          state.updateCorrection(correction.id, {
            error: e.message,
          });
        });

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
      <Button
        className="w-[100px] mx-auto items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
        onClick={() => recipeRequest(selectedModelId)}
      >
        Recipe
      </Button>
    </div>
  );
}

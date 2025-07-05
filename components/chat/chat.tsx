"use client";

import { defaultModel, type modelID } from "@/ai/providers";
import { ConversationType, MessageType } from "@/lib/types";
import { useChat } from "@ai-sdk/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { InitialScreen } from "../help/initial-screen";
import { Messages } from "./messages";
import { Textarea } from "./textarea";

export default function Chat({
  isLoaded,
  conversation,
  setConversationTitle,
  onMessageUpdate,
}: {
  isLoaded: boolean;
  conversation: ConversationType;
  setConversationTitle: (id: string, title: string) => void;
  onMessageUpdate: (id: string, messages: MessageType[]) => void;
}) {
  const [selectedModel, setSelectedModel] = useState<modelID>(defaultModel);
  const currentConversationId = conversation.id;

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    stop,
    setMessages,
  } = useChat({
    maxSteps: 5,
    initialMessages: isLoaded && conversation ? conversation.messages : [],
    body: {
      selectedModel,
    },
    onError: (error) => {
      toast.error(
        error.message.length > 0
          ? error.message
          : "An error occured, please try again later.",
        { position: "top-center", richColors: true }
      );
    },
  });

  // Force update messages when conversation changes
  useEffect(() => {
    setMessages(conversation?.messages || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentConversationId, setMessages]);

  // When new messages are added, update the conversation
  useEffect(() => {
    if (messages.length > 0 && isLoaded && currentConversationId) {
      onMessageUpdate(currentConversationId, messages);

      // On the first message, we also set a title
      if (!conversation?.title) {
        setConversationTitle(
          currentConversationId,
          messages[0].content.slice(0, 20)
        );
      }
    }
  }, [
    messages,
    isLoaded,
    currentConversationId,
    onMessageUpdate,
    setConversationTitle,
    conversation,
  ]);

  const isLoading = status === "streaming" || status === "submitted";

  return (
    <div
      className="flex-1 flex flex-col justify-center"
      key={currentConversationId}
    >
      {messages.length === 0 ? (
        <div className="max-w-xl mx-auto w-full">
          <InitialScreen />
        </div>
      ) : (
        <Messages messages={messages} isLoading={isLoading} status={status} />
      )}
      <form
        onSubmit={handleSubmit}
        className="pb-8 bg-white dark:bg-black w-full max-w-xl mx-auto px-4 sm:px-0"
      >
        <Textarea
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          handleInputChange={handleInputChange}
          input={input}
          isLoading={isLoading}
          status={status}
          stop={stop}
        />
      </form>
    </div>
  );
}

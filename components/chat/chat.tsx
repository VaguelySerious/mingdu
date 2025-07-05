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
  onMessageUpdate,
}: {
  isLoaded: boolean;
  conversation: ConversationType;
  onMessageUpdate: (id: string, messages: MessageType[]) => void;
}) {
  const [selectedModel, setSelectedModel] = useState<modelID>(defaultModel);
  const [currentConversationId, setCurrentConversationId] = useState(
    conversation.id
  );

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    stop,
    setMessages,
  } = useChat({
    initialMessages: isLoaded ? conversation.messages : [],
    initialInput: isLoaded && !conversation.title ? "你怎么样？" : "",
    body: { selectedModel },
    onFinish: (message) => {
      onMessageUpdate(currentConversationId, [...messages, message]);
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

  // When the conversation changes, we need to update the messages
  useEffect(() => {
    if (conversation.id !== currentConversationId) {
      setMessages(conversation.messages);
      setCurrentConversationId(conversation.id);
    }
  }, [conversation, currentConversationId, setMessages]);

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

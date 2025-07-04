"use client";

import { defaultModel, type modelID } from "@/ai/providers";
import { useConversationStorage } from "@/lib/hooks/use-conversation-storage";
import { type ConversationType } from "@/lib/types";
import { useChat } from "@ai-sdk/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { InitialScreen } from "../layout/initial-screen";
import { Sidebar } from "../sidebar/sidebar";
import { Messages } from "./messages";
import { Textarea } from "./textarea";

export default function Chat() {
  const [selectedModel, setSelectedModel] = useState<modelID>(defaultModel);
  const {
    isLoaded,
    conversations,
    currentConversationId,
    createConversation,
    updateConversationMessages,
  } = useConversationStorage();

  const [conversationSwitched, setConversationSwitched] = useState(false);

  // Memoize current conversation to prevent unnecessary re-renders
  const currentConversation = useMemo(() => {
    if (!currentConversationId) return null;
    return (
      conversations.find((conv) => conv.id === currentConversationId) || null
    );
  }, [currentConversationId, conversations]);

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
    initialMessages:
      isLoaded && currentConversation ? currentConversation.messages : [],
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

  // Handle conversation switching
  const handleConversationSwitch = useCallback(
    (conversationId: string) => {
      const conversation = conversations.find(
        (conv: ConversationType) => conv.id === conversationId
      );
      if (conversation) {
        setMessages(conversation.messages);
        setConversationSwitched(true);
      }
    },
    [conversations, setMessages]
  );

  // Handle new conversation
  const handleNewConversation = useCallback(() => {
    // Create a new conversation immediately
    createConversation();
    setMessages([]);
    // Set conversationSwitched to prevent double-creation
    setConversationSwitched(true);
  }, [createConversation, setMessages]);

  // Save messages to conversation storage whenever they change
  useEffect(() => {
    if (
      isLoaded &&
      messages.length > 0 &&
      currentConversationId &&
      !conversationSwitched
    ) {
      // Update existing conversation
      updateConversationMessages(currentConversationId, messages);
    }
  }, [
    messages,
    isLoaded,
    currentConversationId,
    updateConversationMessages,
    conversationSwitched,
  ]);

  // Reset conversation switched flag
  useEffect(() => {
    if (conversationSwitched) {
      setConversationSwitched(false);
    }
  }, [conversationSwitched]);

  // No longer auto-create conversations - they are created when user submits a message

  const isLoading = status === "streaming" || status === "submitted";

  return (
    <div className="h-dvh flex">
      <Sidebar
        onConversationSwitch={handleConversationSwitch}
        onNewConversation={handleNewConversation}
      />
      <div className="flex-1 flex flex-col justify-center">
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
    </div>
  );
}

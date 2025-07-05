"use client";

import { useConversationStorage } from "@/lib/hooks/use-conversation-storage";
import { useEffect } from "react";
import Chat from "./chat/chat";
import { Sidebar } from "./sidebar/sidebar";

export const Main = () => {
  const {
    isLoaded,
    conversations,
    currentConversation,
    createConversation,
    updateConversationMessages,
    setConversationTitle,
    switchToConversation,
    deleteConversation,
  } = useConversationStorage();

  const onNewConversation = () => {
    const newConversationId = createConversation([]);
    switchToConversation(newConversationId);
  };

  useEffect(() => {
    if (
      currentConversation &&
      currentConversation.messages.length >= 1 &&
      !currentConversation.title
    ) {
      console.log("Setting title", currentConversation.messages[0].content);
      setConversationTitle(
        currentConversation.id,
        currentConversation.messages[0].content.slice(0, 20)
      );
    }
  }, [currentConversation, setConversationTitle]);

  return (
    <div className="h-dvh flex">
      {currentConversation && (
        <Sidebar
          conversations={conversations}
          currentConversation={currentConversation}
          onNewConversation={onNewConversation}
          switchToConversation={switchToConversation}
          deleteConversation={deleteConversation}
        />
      )}
      {currentConversation && (
        <main className="flex-1">
          <Chat
            isLoaded={isLoaded}
            conversation={currentConversation}
            onMessageUpdate={updateConversationMessages}
          />
        </main>
      )}
    </div>
  );
};

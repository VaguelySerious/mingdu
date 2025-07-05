"use client";

import { useConversationStorage } from "@/lib/hooks/use-conversation-storage";
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
  console.log(JSON.stringify(conversations, null, 2));
  console.log("Current conversation", currentConversation);

  const onNewConversation = () => {
    const newConversation = createConversation([]);
    switchToConversation(newConversation);
  };

  return (
    <div className="h-dvh flex">
      <Sidebar
        conversations={conversations}
        currentConversation={currentConversation}
        onNewConversation={onNewConversation}
        switchToConversation={switchToConversation}
        deleteConversation={deleteConversation}
      />
      {currentConversation && (
        <main className="flex-1">
          <Chat
            isLoaded={isLoaded}
            conversation={currentConversation}
            setConversationTitle={setConversationTitle}
            onMessageUpdate={updateConversationMessages}
          />
        </main>
      )}
    </div>
  );
};

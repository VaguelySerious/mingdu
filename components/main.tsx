"use client";

import { useChatStore } from "@/lib/store";
import Chat from "./chat/chat";
import { Sidebar } from "./sidebar/sidebar";

export const Main = () => {
  const currentConversationId = useChatStore(
    (state) => state.currentConversationId
  );

  return (
    <div className="h-dvh flex">
      <Sidebar />
      {currentConversationId && (
        <main className="flex-1">
          <Chat conversationId={currentConversationId} />
        </main>
      )}
    </div>
  );
};

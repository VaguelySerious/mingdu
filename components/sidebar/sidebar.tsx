"use client";

import { Button } from "@/components/ui/button";
import { useChatStore } from "@/lib/store";
import { generateId } from "ai";
import { Plus } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { ModelPicker } from "../settings/model-picker";
import { Conversation } from "./conversation";

export function Sidebar() {
  const currentConversationId = useChatStore(
    (state) => state.currentConversationId
  );
  const conversations = Object.values(
    useChatStore((state) => state.conversations)
  ).sort((a, b) => b.createdAt - a.createdAt);
  const currentConversation = conversations.find(
    (c) => c.id === currentConversationId
  );

  const selectConversation = useChatStore((state) => state.selectConversation);
  const onNewConversation = useChatStore((state) => state.createConversation);
  const deleteConversation = useChatStore((state) => state.deleteConversation);
  const updateConversation = useChatStore((state) => state.updateConversation);

  const handleConversationClick = (conversationId: string) => {
    selectConversation(conversationId);
  };

  const handleNewConversation = () => {
    const id = generateId();
    onNewConversation(id);
    selectConversation(id);
  };

  const handleDeleteConversation = (conversationId: string) => {
    if (conversations.length > 1) {
      deleteConversation(conversationId);
    }
  };

  useEffect(() => {
    if (
      currentConversation &&
      currentConversation.messageIds.length >= 1 &&
      !currentConversation.title
    ) {
      const message =
        useChatStore.getState().messages[currentConversation.messageIds[0]];
      const content = message.words.join("");
      const title = content.slice(0, 20);
      updateConversation(currentConversation.id, {
        title,
      });
    }
  }, [currentConversation, updateConversation]);

  return (
    <aside className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-2">
          <Image
            src="/logo.png"
            alt="MingDu"
            width={48}
            height={48}
            className="dark:invert"
          />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            MingDu
          </h1>
        </div>
      </div>
      {/* New Conversation Button */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <Button
          disabled={
            conversations.length > 0 && !currentConversation?.messageIds.length
          }
          onClick={handleNewConversation}
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </Button>
      </div>
      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {conversations.map((conversation) => (
            <Conversation
              key={conversation.id}
              conversation={conversation}
              selected={currentConversation?.id === conversation.id}
              canDelete={conversations.length > 1}
              onClick={handleConversationClick}
              onDelete={handleDeleteConversation}
            />
          ))}
        </div>
      </div>
      <ModelPicker />
    </aside>
  );
}

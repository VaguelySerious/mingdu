"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Image from "next/image";
import { Conversation } from "./conversation";

import { ConversationType } from "@/lib/types";
interface SidebarProps {
  onNewConversation: () => void;
  conversations: ConversationType[];
  currentConversation: ConversationType;
  switchToConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
}

export function Sidebar({
  onNewConversation,
  conversations,
  currentConversation,
  switchToConversation,
  deleteConversation,
}: SidebarProps) {
  const handleConversationClick = (conversationId: string) => {
    switchToConversation(conversationId);
  };

  const handleNewConversation = () => {
    onNewConversation();
  };

  const handleDeleteConversation = (conversationId: string) => {
    if (conversations.length > 1) {
      deleteConversation(conversationId);
    }
  };

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
          disabled={!currentConversation.messages.length}
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
          {conversations
            .filter((c) => c.title)
            .map((conversation) => (
              <Conversation
                key={conversation.id}
                conversation={conversation}
                selected={currentConversation.id === conversation.id}
                canDelete={conversations.length > 1}
                onClick={handleConversationClick}
                onDelete={handleDeleteConversation}
              />
            ))}
        </div>
      </div>
    </aside>
  );
}

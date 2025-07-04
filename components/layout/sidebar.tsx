"use client";

import { Button } from "@/components/ui/button";
import { useConversationStorage } from "@/lib/hooks/use-conversation-storage";
import { MessageCircle, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { Counter } from "./sidebar/counter";

interface SidebarProps {
  onConversationSwitch: (conversationId: string) => void;
  onNewConversation: () => void;
}

export function Sidebar({
  onConversationSwitch,
  onNewConversation,
}: SidebarProps) {
  const {
    conversations,
    currentConversationId,
    switchToConversation,
    deleteConversation,
  } = useConversationStorage();

  const handleConversationClick = (conversationId: string) => {
    switchToConversation(conversationId);
    onConversationSwitch(conversationId);
  };

  const handleNewConversation = () => {
    onNewConversation();
  };

  const handleDeleteConversation = (
    e: React.MouseEvent,
    conversationId: string
  ) => {
    e.stopPropagation();
    if (conversations.length > 1) {
      deleteConversation(conversationId);
    }
  };

  return (
    <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-2">
          <Image
            src="/logo.svg"
            alt="MingDu"
            width={24}
            height={24}
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
          {conversations.map((conversation) => {
            const messageCount = conversation.messages.length;

            return (
              <div
                key={conversation.id}
                onClick={() => handleConversationClick(conversation.id)}
                className={`
                  flex items-center justify-between p-3 rounded-lg cursor-pointer group
                  ${
                    currentConversationId === conversation.id
                      ? "bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }
                `}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <MessageCircle className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {conversation.title}
                    </p>
                    <div className="flex items-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(conversation.updatedAt).toLocaleDateString()}
                      </p>
                      <Counter count={messageCount} />
                    </div>
                  </div>
                </div>
                {conversations.length > 1 && (
                  <Button
                    onClick={(e) =>
                      handleDeleteConversation(e, conversation.id)
                    }
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto hover:bg-red-100 dark:hover:bg-red-900 ml-2"
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

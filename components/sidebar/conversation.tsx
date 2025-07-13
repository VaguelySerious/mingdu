"use client";

import { ConversationType } from "@/lib/store";
import { MessageCircle, Trash2 } from "lucide-react";
import { Button } from "../ui/button";

export const Conversation = ({
  conversation,
  selected,
  canDelete,
  onClick,
  onDelete,
}: {
  conversation: ConversationType;
  selected?: boolean;
  canDelete?: boolean;
  onClick: (conversationId: string) => void;
  onDelete: (conversationId: string) => void;
}) => {
  const messageCount = conversation.messageIds.length;

  return (
    <div
      key={conversation.id}
      onClick={() => onClick(conversation.id)}
      className={`
                  flex items-center justify-between p-3 rounded-lg cursor-pointer group
                  ${
                    selected
                      ? "bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }
                `}
    >
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <MessageCircle className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {conversation.title || "New Chat"}
            </p>
          </div>
          <p className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <span className="mr-2">
              {new Date(conversation.updatedAt).toLocaleDateString()}
            </span>
            {messageCount > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full flex-shrink-0">
                {messageCount}
              </span>
            )}
          </p>
        </div>
      </div>
      {canDelete && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(conversation.id);
          }}
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto hover:bg-red-100 dark:hover:bg-red-900 ml-2"
        >
          <Trash2 className="w-3 h-3 text-red-500" />
        </Button>
      )}
    </div>
  );
};

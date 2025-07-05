"use client";

import { type ConversationType, type MessageType } from "@/lib/types";
import { useCallback, useEffect, useMemo, useState } from "react";

const CONVERSATIONS_KEY = "mingdu-conversations";
const CURRENT_CONVERSATION_KEY = "mingdu-current-conversation";

const DEFAULT_CONVERSATION: ConversationType = {
  id: "default",
  title: null,
  messages: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function useConversationStorage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [conversations, setConversations] = useState<ConversationType[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);

  // Load conversations from localStorage on mount
  useEffect(() => {
    try {
      const storedConversations = localStorage.getItem(CONVERSATIONS_KEY);
      const currentId = localStorage.getItem(CURRENT_CONVERSATION_KEY);

      if (storedConversations) {
        const parsed = JSON.parse(storedConversations) as ConversationType[];
        setConversations(parsed);
        if (currentId && parsed.find((c) => c.id === currentId)) {
          setCurrentConversationId(currentId);
        }
      } else {
        setConversations([DEFAULT_CONVERSATION]);
        setCurrentConversationId(DEFAULT_CONVERSATION.id);
      }
    } catch (error) {
      console.error("Failed to load conversations from localStorage:", error);
      setConversations([DEFAULT_CONVERSATION]);
    }
    setIsLoaded(true);
  }, []);

  // Save conversations to localStorage
  const saveConversations = useCallback((convs: ConversationType[]) => {
    try {
      localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(convs));
    } catch (error) {
      console.error("Failed to save conversations to localStorage:", error);
    }
  }, []);

  // Save current conversation ID
  const saveCurrentConversationId = useCallback((id: string | null) => {
    try {
      if (id) {
        localStorage.setItem(CURRENT_CONVERSATION_KEY, id);
      } else {
        localStorage.removeItem(CURRENT_CONVERSATION_KEY);
      }
    } catch (error) {
      console.error("Failed to save current conversation ID:", error);
    }
  }, []);

  // Generate conversation title from first message
  const generateConversationTitle = useCallback(
    (messages: MessageType[]): string => {
      if (messages.length === 0) return "New Conversation";

      const firstUserMessage = messages.find((m) => m.role === "user");
      if (firstUserMessage && firstUserMessage.content) {
        const content =
          typeof firstUserMessage.content === "string"
            ? firstUserMessage.content
            : String(firstUserMessage.content);
        return content.slice(0, 50) + (content.length > 50 ? "..." : "");
      }

      return "New Conversation";
    },
    []
  );

  // Create new conversation
  const createConversation = useCallback(
    (initialMessages: MessageType[] = []): string => {
      const id = Date.now().toString();
      const now = new Date().toISOString();
      const newConversation: ConversationType = {
        id,
        title: null,
        messages: initialMessages,
        createdAt: now,
        updatedAt: now,
      };

      setConversations((prev) => {
        const updatedConversations = [newConversation, ...prev];
        saveConversations(updatedConversations);
        return updatedConversations;
      });
      return id;
    },
    [saveConversations]
  );

  // Update conversation messages
  const updateConversationMessages = useCallback(
    (id: string, messages: MessageType[]) => {
      setConversations((prev) => {
        const updatedConversations = prev.map((conv) => {
          if (conv.id === id) {
            return {
              ...conv,
              messages,
              title:
                conv.title === "New Conversation"
                  ? generateConversationTitle(messages)
                  : conv.title,
              updatedAt: new Date().toISOString(),
            };
          }
          return conv;
        });

        saveConversations(updatedConversations);
        return updatedConversations;
      });
    },
    [generateConversationTitle, saveConversations]
  );

  // Switch to conversation
  const switchToConversation = useCallback(
    (id: string) => {
      setCurrentConversationId(id);
      saveCurrentConversationId(id);
    },
    [saveCurrentConversationId]
  );

  // Clear current conversation selection
  const clearCurrentConversation = useCallback(() => {
    setCurrentConversationId(null);
    saveCurrentConversationId(null);
  }, [saveCurrentConversationId]);

  // Delete conversation
  const deleteConversation = useCallback(
    (id: string) => {
      let nextConversationId: string | null = null;

      setConversations((prev) => {
        const updatedConversations = prev.filter((conv) => conv.id !== id);
        saveConversations(updatedConversations);

        // Determine next conversation if we're deleting the current one
        if (currentConversationId === id) {
          const nextConversation = updatedConversations[0];
          nextConversationId = nextConversation ? nextConversation.id : null;
        }

        return updatedConversations;
      });

      // Update current conversation ID if needed
      if (currentConversationId === id) {
        setCurrentConversationId(nextConversationId);
        saveCurrentConversationId(nextConversationId);
      }
    },
    [currentConversationId, saveConversations, saveCurrentConversationId]
  );

  const setConversationTitle = useCallback(
    (id: string, title: string) => {
      setConversations((prev) => {
        const updatedConversations = prev.map((conv) => {
          if (conv.id === id) {
            return { ...conv, title };
          }
          return conv;
        });

        saveConversations(updatedConversations);
        return updatedConversations;
      });
    },
    [saveConversations]
  );

  const currentConversation = useMemo(() => {
    return conversations.find((conv) => conv.id === currentConversationId);
  }, [conversations, currentConversationId]);

  return {
    isLoaded,
    conversations,
    currentConversationId,
    currentConversation,
    setConversationTitle,
    generateConversationTitle,
    createConversation,
    updateConversationMessages,
    switchToConversation,
    clearCurrentConversation,
    deleteConversation,
  };
}

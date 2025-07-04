"use client";

import {
  type ConversationType,
  type MessageType as Message,
} from "@/lib/types";
import { useCallback, useEffect, useState } from "react";

const CONVERSATIONS_KEY = "mingdu-conversations";
const CURRENT_CONVERSATION_KEY = "mingdu-current-conversation";

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
      }

      if (currentId) {
        setCurrentConversationId(currentId);
      }
    } catch (error) {
      console.error("Failed to load conversations from localStorage:", error);
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
  const generateTitle = useCallback((messages: Message[]): string => {
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
  }, []);

  // Create new conversation
  const createConversation = useCallback((): string => {
    const id = Date.now().toString();
    const now = new Date().toISOString();
    const newConversation: ConversationType = {
      id,
      title: "New Conversation",
      messages: [],
      createdAt: now,
      updatedAt: now,
    };

    setConversations((prev) => {
      const updatedConversations = [newConversation, ...prev];
      saveConversations(updatedConversations);
      return updatedConversations;
    });

    setCurrentConversationId(id);
    saveCurrentConversationId(id);

    return id;
  }, [saveConversations, saveCurrentConversationId]);

  // Update conversation messages
  const updateConversationMessages = useCallback(
    (id: string, messages: Message[]) => {
      setConversations((prev) => {
        const updatedConversations = prev.map((conv) => {
          if (conv.id === id) {
            return {
              ...conv,
              messages,
              title:
                conv.title === "New Conversation"
                  ? generateTitle(messages)
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
    [generateTitle, saveConversations]
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

  // Get current conversation
  const getCurrentConversation = useCallback((): ConversationType | null => {
    if (!currentConversationId) return null;
    return (
      conversations.find((conv) => conv.id === currentConversationId) || null
    );
  }, [currentConversationId, conversations]);

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

  return {
    isLoaded,
    conversations,
    currentConversationId,
    createConversation,
    updateConversationMessages,
    switchToConversation,
    clearCurrentConversation,
    getCurrentConversation,
    deleteConversation,
  };
}

import { defaultModelId, ModelType } from "@/ai/provider";
import { omit } from "lodash-es";
import { create } from "zustand";

export type ConversationType = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messageIds: string[];
};

export type MessageType = {
  id: string;
  role: "user" | "assistant" | "system";
  createdAt: number;
  words: string[];
  isLoading?: boolean;
  error?: string;
};

export type CorrectionType = {
  id: string;
  messageId: string;
  items: {
    original: string;
    correction: string;
    explanation: string;
  }[];
  createdAt: number;
  isLoading?: boolean;
  error?: string;
};

interface ChatState {
  conversations: Record<string, ConversationType>;
  messages: Record<string, MessageType>;
  corrections: Record<string, CorrectionType>;

  currentConversationId: string | null;
  selectedModelId: ModelType;

  // Settings
  setSelectedModelId: (modelId: ModelType) => void;
  selectConversation: (id: string | null) => void;

  // Conversations
  createConversation: (id: string) => void;
  updateConversation: (
    id: string,
    conversation: Partial<Omit<ConversationType, "id" | "createdAt">>
  ) => void;
  deleteConversation: (id: string) => void;

  // Messages
  addMessage: (conversationId: string, message: MessageType) => void;
  addWordToMessage: (messageId: string, word: string) => void;
  updateMessage: (
    id: string,
    message: Partial<Omit<MessageType, "id" | "createdAt">>
  ) => void;
  deleteMessage: (id: string) => void;

  // Corrections
  addCorrection: (correction: CorrectionType) => void;
  addCorrectionItem: (
    correctionId: string,
    correctionItem: CorrectionType["items"][number]
  ) => void;
  updateCorrection: (
    id: string,
    correction: Partial<Omit<CorrectionType, "id" | "createdAt">>
  ) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: {},
  messages: {},
  corrections: {},
  currentConversationId: null,
  selectedModelId: defaultModelId,

  selectConversation: (id: string | null) => {
    set({ currentConversationId: id });
  },

  setSelectedModelId: (modelId: ModelType) => {
    set({ selectedModelId: modelId });
  },

  createConversation: (id: string) => {
    set((state) => ({
      conversations: {
        ...state.conversations,
        [id]: {
          id,
          title: "",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messageIds: [],
        },
      },
    }));
  },

  updateConversation: (
    id: string,
    conversation: Partial<Omit<ConversationType, "id" | "createdAt">>
  ) => {
    set((state) => ({
      conversations: {
        ...state.conversations,
        [id]: { ...state.conversations[id], ...conversation },
      },
    }));
  },

  addMessageToConversation: (conversationId: string, messageId: string) => {
    set((state) => ({
      conversations: {
        ...state.conversations,
        [conversationId]: {
          ...state.conversations[conversationId],
          messageIds: [
            ...state.conversations[conversationId].messageIds,
            messageId,
          ],
        },
      },
    }));
  },

  deleteConversation: (id: string) => {
    set((state) => {
      const messageIds = state.conversations[id]?.messageIds ?? [];
      return {
        currentConversationId:
          state.currentConversationId === id
            ? null
            : state.currentConversationId,
        conversations: { ...omit(state.conversations, id) },
        messages: { ...omit(state.messages, messageIds) },
      };
    });
  },

  addMessage: (conversationId: string, message: MessageType) => {
    set((state) => ({
      conversations: {
        ...state.conversations,
        [conversationId]: {
          ...state.conversations[conversationId],
          updatedAt: Date.now(),
          messageIds: [
            ...state.conversations[conversationId].messageIds,
            message.id,
          ],
        },
      },
      messages: {
        ...state.messages,
        [message.id]: message,
      },
    }));
  },

  updateMessage: (
    id: string,
    message: Partial<Omit<MessageType, "id" | "createdAt">>
  ) => {
    set((state) => {
      const conversation = Object.values(state.conversations).find((c) =>
        c.messageIds.includes(id)
      );
      return {
        conversations: conversation
          ? {
              ...state.conversations,
              [conversation.id]: {
                ...conversation,
                updatedAt: Date.now(),
              },
            }
          : state.conversations,
        messages: {
          ...state.messages,
          [id]: { ...state.messages[id], ...message },
        },
      };
    });
  },

  addWordToMessage: (messageId: string, word: string) => {
    set((state) => {
      const conversation = Object.values(state.conversations).find((c) =>
        c.messageIds.includes(messageId)
      );
      return {
        conversations: conversation
          ? {
              ...state.conversations,
              [conversation.id]: {
                ...conversation,
                updatedAt: Date.now(),
              },
            }
          : state.conversations,
        messages: {
          ...state.messages,
          [messageId]: {
            ...state.messages[messageId],
            words: [...state.messages[messageId].words, word],
          },
        },
      };
    });
  },

  deleteMessage: (id: string) => {
    set((state) => {
      const conversationForThisMessage = Object.values(
        state.conversations
      ).find((conversation) => conversation.messageIds.includes(id));

      const conversations = { ...state.conversations };
      if (conversationForThisMessage) {
        conversationForThisMessage.messageIds =
          conversationForThisMessage.messageIds.filter(
            (messageId) => messageId !== id
          );
        conversations[conversationForThisMessage.id] =
          conversationForThisMessage;
      }

      return {
        messages: omit(state.messages, id),
        conversations,
      };
    });
  },

  updateConversationTitle: (id: string, title: string) => {
    set((state) => ({
      conversations: {
        ...state.conversations,
        [id]: { ...state.conversations[id], title },
      },
    }));
  },

  addCorrection: (correction: CorrectionType) => {
    set((state) => ({
      corrections: {
        ...state.corrections,
        [correction.id]: correction,
      },
    }));
  },

  addCorrectionItem: (
    correctionId: string,
    correctionItem: CorrectionType["items"][number]
  ) => {
    set((state) => ({
      corrections: {
        ...state.corrections,
        [correctionId]: {
          ...state.corrections[correctionId],
          items: [...state.corrections[correctionId].items, correctionItem],
        },
      },
    }));
  },
  updateCorrection: (
    id: string,
    correction: Partial<Omit<CorrectionType, "id" | "createdAt">>
  ) => {
    set((state) => ({
      corrections: {
        ...state.corrections,
        [id]: { ...state.corrections[id], ...correction },
      },
    }));
  },
}));

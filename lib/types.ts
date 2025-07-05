import type { Message as MessageType } from "ai";

export interface ConversationType {
  id: string;
  title: string | null;
  messages: MessageType[];
  createdAt: string;
  updatedAt: string;
}

export { type MessageType };

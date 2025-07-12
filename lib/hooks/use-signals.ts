import { useCallback, useEffect } from "react";

type MessageCallback<T> = (message: T) => void;

export enum SIGNAL_TOPICS {
  MESSAGE_COMPLETED = "message_completed",
}

type Topic = (typeof SIGNAL_TOPICS)[keyof typeof SIGNAL_TOPICS];

type TopicMessageMap = {
  [SIGNAL_TOPICS.MESSAGE_COMPLETED]: {
    messageId: string;
    conversationId: string;
  };
};

// Map of topics to sets of callbacks
const signalCallbacks = new Map<
  Topic,
  Set<MessageCallback<TopicMessageMap[Topic]>>
>();

/**
 * Send a message to all listeners registered for a specific topic.
 * @param topic The topic to broadcast to
 * @param message The message to broadcast
 */
export function sendSignal<T extends Topic>(
  topic: T,
  message: TopicMessageMap[T]
): void {
  const callbacks = signalCallbacks.get(topic);
  if (callbacks) {
    callbacks.forEach((cb) => cb(message));
  }
}

/**
 * Register a callback to be called whenever we get a broadcast message for a specific topic.
 * The callback is responsible for determining whether the message is relevant.
 * @param topic The topic to listen to
 * @param callback The callback to be called when a message is received
 * @returns A function to unsubscribe from the topic
 */
export const addSignalListener = <T extends Topic>(
  topic: T,
  callback: MessageCallback<TopicMessageMap[T]>
) => {
  if (!signalCallbacks.has(topic)) {
    signalCallbacks.set(topic, new Set());
  }
  const callbacks = signalCallbacks.get(topic)!;
  callbacks.add(callback);

  return () => {
    callbacks.delete(callback);
  };
};

export const useSignal = <T extends Topic>(
  topic: T,
  callback: MessageCallback<TopicMessageMap[T]>,
  callbackDeps: unknown[]
) => {
  const cachedCallback = useCallback((message: TopicMessageMap[T]) => {
    return callback(message);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, callbackDeps);
  useEffect(() => {
    return addSignalListener(topic, cachedCallback);
  }, [topic, cachedCallback]);
};

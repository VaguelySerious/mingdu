"use client";

import { useChatStore } from "@/lib/store";
import { useEffect } from "react";
import { toast } from "sonner";
import Chat from "./chat/chat";
import { Sidebar } from "./sidebar/sidebar";
import { initKnownHSKLevels } from "./skill/init";
import { NoSSR } from "./ui/no-ssr";

export const Main = () => {
  const currentConversationId = useChatStore(
    (state) => state.currentConversationId
  );
  const wordLevelOverwrites = useChatStore(
    (state) => state.wordLevelOverwrites
  );
  const setWordLevelOverwrites = useChatStore(
    (state) => state.setWordLevelOverwrites
  );
  const firstWordLevel = wordLevelOverwrites["你"];
  const needsInit = wordLevelOverwrites.length && firstWordLevel !== 1;
  console.debug("needsInit", needsInit, firstWordLevel);

  // On the first launch of the app, we need to initialize the store
  // with known/unknown words, and ensure the dictionary is loaded.
  useEffect(() => {
    if (!needsInit) return;
    const initToast = toast.loading("Initializing...");
    initKnownHSKLevels().then(({ wordLevelOverwrites }) => {
      console.debug("wordLevelOverwrites", wordLevelOverwrites.length);
      setWordLevelOverwrites(wordLevelOverwrites);
      toast.success("Initialization complete", {
        id: initToast,
      });
    });
  }, [needsInit]);

  return (
    <div className="h-dvh flex">
      <NoSSR>
        <Sidebar className="h-full" />
        {currentConversationId && (
          <main className="h-full flex-1">
            <Chat conversationId={currentConversationId} />
          </main>
        )}
      </NoSSR>
    </div>
  );
};

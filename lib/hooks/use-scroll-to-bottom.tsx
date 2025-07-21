import { useEffect, useRef, type RefObject } from "react";

export function useScrollToBottom(): [
  RefObject<HTMLDivElement>,
  RefObject<HTMLDivElement>
] {
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const end = endRef.current;

    if (container && end) {
      const observer = new MutationObserver((mutations) => {
        // Only scroll if the changes are to message content, not tooltips or UI elements
        const shouldScroll = mutations.some((mutation) => {
          if (mutation.type === "childList") {
            return Array.from(mutation.addedNodes).some((node) => {
              if (node instanceof Element) {
                // Don't scroll for tooltips, dropdowns, or other UI overlays
                if (
                  node.hasAttribute("data-scroll-ignore") ||
                  node.querySelector("[data-scroll-ignore]") ||
                  node.classList.contains("tooltip") ||
                  node.querySelector(".tooltip")
                ) {
                  return false;
                }

                // Only scroll for actual message content
                const isMessageContent =
                  node.closest("[data-message]") ||
                  node.closest('[data-role="user"], [data-role="assistant"]');
                return isMessageContent;
              }
              return false;
            });
          }
          return false;
        });

        if (shouldScroll) {
          end.scrollIntoView({ behavior: "instant", block: "end" });
        }
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });

      return () => observer.disconnect();
    }
  }, []);

  // @ts-expect-error error
  return [containerRef, endRef];
}

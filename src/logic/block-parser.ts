import { BlockType } from "@/types/block";

const blockPrefixes: Record<BlockType["type"], string> = {
  story: "I was given the following story to discuss",
  task: "And this question to answer",
  user_answer: "To which I answered",
  user_question: "I asked this for clarification",
  ai_answer: "And my tutor responded with",
  // Not mapped
  system: "",
};

/**
 * Converts blocks to messages for models
 */
export const blocksToModelInput = (blocks: BlockType[]) => {
  return blocks
    .map((block) => {
      if (blockPrefixes[block.type]) {
        return `${blockPrefixes[block.type]}: ${block.text}`;
      }
      return null;
    })
    .filter(Boolean)
    .join("\n\n");
};

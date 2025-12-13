import { useChatStore } from "@/lib/store";
import { getSkillAlgorithm } from "./algos";

export const useSkillLevel = (word: string) => {
  const wordReadCount = useChatStore((state) => state.wordReadCounts[word]);
  const wordWriteCount = useChatStore((state) => state.wordWriteCounts[word]);
  const wordLevelOverWrite =
    useChatStore((state) => state.wordLevelOverwrites[word]) || undefined;
  const skillAlgoChoice = useChatStore((state) => state.skillAlgorithm);

  if (
    wordReadCount === undefined &&
    wordWriteCount === undefined &&
    wordLevelOverWrite === undefined
  ) {
    return {
      level: undefined,
      read: undefined,
      write: undefined,
    };
  }

  const skillLevel =
    wordLevelOverWrite ||
    getSkillAlgorithm(skillAlgoChoice)(wordReadCount, wordWriteCount);

  return {
    level: skillLevel,
    read: wordReadCount,
    write: wordWriteCount,
  };
};

export type SkillLevelType = ReturnType<typeof useSkillLevel>;

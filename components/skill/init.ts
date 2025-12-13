import { SkillLevel } from "@/components/skill/constants";
import { partition } from "lodash-es";
import { loadDictData } from "../../lib/dictionary";

/**
 * Sometimes we want a user to manually mark all words within a certain
 * HSK levels as known. If they're starting out, usually we do this for
 * HSK 1 + HSK 2, but they might come from a different platform and
 * want to start at a different level.
 */
export const initKnownHSKLevels = async (
  setToLearningHskLevel = 3
): Promise<{ wordLevelOverwrites: Record<string, SkillLevel> }> => {
  const data = await loadDictData();

  const [knownWordEntries, unknownWordEntries] = partition(
    Object.entries(data.hsk || {}),
    (entry) => entry[1] < setToLearningHskLevel
  );
  const knownWords = knownWordEntries.map(([word]) => word);
  const unknownWords = unknownWordEntries.map(([word]) => word);

  return {
    wordLevelOverwrites: {
      ...knownWords.reduce(
        (acc, word) => ({
          ...acc,
          [word]: SkillLevel.MASTERED,
        }),
        {} as Record<string, SkillLevel>
      ),
      ...unknownWords.reduce(
        (acc, word) => ({
          ...acc,
          [word]: SkillLevel.NEW,
        }),
        {} as Record<string, SkillLevel>
      ),
    },
  };
};

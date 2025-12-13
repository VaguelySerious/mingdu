export enum SkillLevel {
  NEW = 0,
  LEARNING = 1,
  FAMILIAR = 2,
  KNOWN = 3,
  MASTERED = 4,
}

export const HSKLevel = {
  BEGINNER: 1,
  ELEMENTARY: 2,
  PRE_INTERMEDIATE: 3,
  INTERMEDIATE: 4,
  UPPER_INTERMEDIATE: 5,
  ADVANCED: 6,
};

export const HSK_LEVELS_TO_BG_COLORS: Record<number, string> = {
  [HSKLevel.BEGINNER]: "bg-yellow-600",
  [HSKLevel.ELEMENTARY]: "bg-cyan-700",
  [HSKLevel.PRE_INTERMEDIATE]: "bg-orange-500",
  [HSKLevel.INTERMEDIATE]: "bg-red-500",
  [HSKLevel.UPPER_INTERMEDIATE]: "bg-indigo-700",
  [HSKLevel.ADVANCED]: "bg-violet-700",
};

export const HSK_LEVELS_TO_TEXT_COLORS: Record<number, string> = {
  [HSKLevel.BEGINNER]: "text-black",
  [HSKLevel.ELEMENTARY]: "text-white",
  [HSKLevel.PRE_INTERMEDIATE]: "text-black",
  [HSKLevel.INTERMEDIATE]: "text-white",
  [HSKLevel.UPPER_INTERMEDIATE]: "text-white",
  [HSKLevel.ADVANCED]: "text-white",
};

export const SKILL_LEVELS_TO_COLORS: Record<number, string> = {
  [SkillLevel.NEW]: "text-orange-500",
  [SkillLevel.LEARNING]: "text-yellow-500",
  [SkillLevel.FAMILIAR]: "text-yellow-600",
  [SkillLevel.KNOWN]: "text-yellow-900",
  [SkillLevel.MASTERED]: "text-black",
};

export const SKILL_LEVELS_TO_BG_COLORS: Record<number, string> = {
  [SkillLevel.NEW]: "bg-orange-500",
  [SkillLevel.LEARNING]: "bg-yellow-500",
  [SkillLevel.FAMILIAR]: "bg-yellow-600",
  [SkillLevel.KNOWN]: "bg-yellow-900",
  [SkillLevel.MASTERED]: "bg-black",
};
export const SKILL_LEVELS_TO_DESCRIPTIONS: Record<SkillLevel, string> = {
  [SkillLevel.NEW]: "New",
  [SkillLevel.LEARNING]: "Learning",
  [SkillLevel.FAMILIAR]: "Adept",
  [SkillLevel.KNOWN]: "Familiar",
  [SkillLevel.MASTERED]: "Mastered",
};

import { SkillLevel } from "./constants";

export type SkillAlgorithmType = "v1";

export const getSkillAlgorithm = (algorithm: SkillAlgorithmType) => {
  switch (algorithm) {
    case "v1":
      return v1;
  }
};

export const v1 = (
  wordReadCount: number,
  wordWriteCount: number
): SkillLevel => {
  const scale = [0, 5, 15, 50, 200];
  const score = wordReadCount + wordWriteCount * 3;
  const level = scale.findIndex((s) => score >= s);
  return Math.min(level, Object.keys(SkillLevel).length - 1) as SkillLevel;
};

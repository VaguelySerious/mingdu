import { cn } from "@/lib/utils";
import {
  SKILL_LEVELS_TO_COLORS,
  SKILL_LEVELS_TO_DESCRIPTIONS,
} from "./constants";
import { SkillLevelType } from "./use-skill";

export const SkillLevelBadge = ({ level, read, write }: SkillLevelType) => {
  const description = SKILL_LEVELS_TO_DESCRIPTIONS[level];
  const textColor = SKILL_LEVELS_TO_COLORS[level];
  return (
    <div
      className={cn(
        "rounded-md px-2 py-1 text-sm whitespace-nowrap bg-gray-200",
        textColor
      )}
    >
      {description}
    </div>
  );
};

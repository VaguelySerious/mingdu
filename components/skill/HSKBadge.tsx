import { HSK_LEVELS_TO_BG_COLORS } from "./levels";

export const HSKLevelBadge = ({ level }: { level: number }) => {
  return (
    <div
      className={`rounded-md px-2 py-1 text-sm whitespace-nowrap ${
        HSK_LEVELS_TO_BG_COLORS[level] || "bg-gray-200"
      }`}
    >
      HSK {level}
    </div>
  );
};

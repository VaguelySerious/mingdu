import { cn } from "@/lib/utils";
import {
  HSK_LEVELS_TO_BG_COLORS,
  HSK_LEVELS_TO_TEXT_COLORS,
} from "./constants";

export const HSKLevelBadge = ({ level }: { level: number }) => {
  const bgColor = HSK_LEVELS_TO_BG_COLORS[level] || "bg-gray-200";
  const textColor = HSK_LEVELS_TO_TEXT_COLORS[level] || "text-black";
  return (
    <div
      className={cn(
        "rounded-md px-2 py-1 text-sm whitespace-nowrap",
        bgColor,
        textColor
      )}
    >
      HSK {level}
    </div>
  );
};

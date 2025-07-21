import {
  HSK_LEVELS_TO_BG_COLORS,
  SKILL_LEVELS_TO_BG_COLORS,
  SKILL_LEVELS_TO_DESCRIPTIONS,
} from "../skill/levels";

export const Legend = () => {
  return (
    <div className="mt-4 pt-3 border-t border-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-medium text-foreground">
            Word Learning Progress:
          </h4>
          {/* TODO: Hoverable info on what this means */}
          <div className="flex flex-wrap gap-4">
            {Object.entries(SKILL_LEVELS_TO_BG_COLORS).map(([level, color]) => (
              <div className="flex items-center gap-2" key={level}>
                <div className={`w-3 h-3 rounded-full ${color}`}></div>
                <span className="text-sm text-muted-foreground">
                  {SKILL_LEVELS_TO_DESCRIPTIONS[Number(level)]}
                </span>
              </div>
            ))}
          </div>
          {/* TODO: Link to definitions */}
          <h4 className="text-sm font-medium text-foreground">HSK Levels:</h4>
          <div className="flex flex-wrap gap-4">
            {Object.entries(HSK_LEVELS_TO_BG_COLORS).map(([level, color]) => (
              <div className="flex items-center gap-2" key={level}>
                <div className={`w-3 h-3 rounded-full ${color}`}></div>
                <span className="text-sm text-muted-foreground">
                  HSK {level}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const SkillBadge = ({ level }: { level: number }) => {
  const colorMap: Record<number, string> = {
    1: "bg-green-500",
    2: "bg-green-400",
    3: "bg-green-300",
    4: "bg-green-200",
    5: "bg-green-100",
  };
  return (
    <div
      className={`rounded-md px-2 py-1 text-sm whitespace-nowrap ${
        colorMap[level] || "bg-gray-200"
      }`}
    >
      HSK {level}
    </div>
  );
};

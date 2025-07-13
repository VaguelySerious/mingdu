"use client";

interface CounterProps {
  count: number;
}

export function Counter({ count }: CounterProps) {
  if (count === 0) return null;

  return (
    <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full flex-shrink-0">
      {count}
    </span>
  );
}

import { CorrectionType } from "./store";

/**
 * Given an array of strings, e.g. ["A", "B", "C", "D"] and a target "CD",
 * finds the start and end indices of the target combined string in the array,
 * e.g. [2, 3] in this example.
 *
 * A more complicated example:
 * ["A", "B", "C", "C", "A", "B", "D"]
 * with target "AB" should result in [0, 1]
 * with target "ABD" should result in [4, 6]
 */
export function findArraySpan(
  array: string[],
  target: string
): [number, number] | null {
  for (let start = 0; start < array.length; ++start) {
    let concat = "";
    for (let end = start; end < array.length; ++end) {
      concat += array[end];
      if (concat === target) return [start, end];
      if (concat.length > target.length) break;
    }
  }
  return null;
}

/**
 * Given an array of words and a list of correction items,
 * returns an array of spans, where each span is a contiguous
 * subarray of the words array, and the correction item is
 * the correction for that span.
 *
 * Overlapping corrections: Only the first correction is applied to any word. Later corrections that overlap with already-corrected words are ignored.
 * Empty input: If words is empty, returns [].
 *
 * Example:
 * words = ["A", "B", "C", "C", "A", "B", "D"]
 * correctionItems = [
 *   { original: "BC", ... },
 *   { original: "ABD", ... }
 * ]
 * returns [
 *   { words: ["A"], correction: undefined },
 *   { words: ["B", "C"], correction: { original: "BC", ... } },
 *   { words: ["C"], correction: undefined },
 *   { words: ["A", "B", "D"], correction: { original: "ABD", ... } },
 * ]
 */
export function wordsAndCorrectionsToSpans(
  words: string[],
  correctionItems: CorrectionType["items"]
): { words: string[]; correction?: CorrectionType["items"][number] }[] {
  if (!words.length) return [];
  if (!correctionItems.length) {
    return [{ words }];
  }

  const used = Array(words.length).fill(false);
  const chunks: Array<{
    start: number;
    end: number;
    correction?: CorrectionType["items"][number];
  }> = [];
  correctionItems.forEach((item) => {
    const span = findArraySpan(words, item.original);
    if (span) {
      const [start, end] = span;
      // Only apply this correction if none of the words are already used
      if (used.slice(start, end + 1).some((v) => v)) return;
      for (let i = start; i <= end; ++i) used[i] = true;
      chunks.push({ start, end, correction: item });
    }
  });
  // Add uncorrected chunks
  let i = 0;
  while (i < words.length) {
    if (!used[i]) {
      let j = i;
      while (j + 1 < words.length && !used[j + 1]) j++;
      chunks.push({ start: i, end: j, correction: undefined });
      i = j + 1;
    } else {
      i++;
    }
  }
  // Sort by start index
  chunks.sort((a, b) => a.start - b.start);
  return chunks.map(({ start, end, correction }) => ({
    words: words.slice(start, end + 1),
    correction,
  }));
}

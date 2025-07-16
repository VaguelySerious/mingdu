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

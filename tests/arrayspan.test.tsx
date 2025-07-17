import { describe, expect, it } from "vitest";
import { findArraySpan, wordsAndCorrectionsToSpans } from "../lib/arrayspan";

describe("findArraySpan", () => {
  it("finds a simple span", () => {
    expect(findArraySpan(["A", "B", "C", "D"], "CD")).toEqual([2, 3]);
  });

  it("finds span at the start", () => {
    expect(findArraySpan(["A", "B", "C", "C", "A", "B", "D"], "AB")).toEqual([
      0, 1,
    ]);
  });

  it("finds span at the end", () => {
    expect(findArraySpan(["A", "B", "C", "C", "A", "B", "D"], "ABD")).toEqual([
      4, 6,
    ]);
  });

  it("returns null if not found", () => {
    expect(findArraySpan(["A", "B", "C"], "AC")).toBeNull();
  });

  it("handles single element match", () => {
    expect(findArraySpan(["A", "B", "C"], "B")).toEqual([1, 1]);
  });

  it("handles empty array", () => {
    expect(findArraySpan([], "A")).toBeNull();
  });

  it("handles empty target", () => {
    expect(findArraySpan(["A", "B"], "")).toBeNull();
  });

  it("handles repeated elements", () => {
    expect(findArraySpan(["A", "A", "A"], "AA")).toEqual([0, 1]);
  });

  it("returns null if target longer than array concat", () => {
    expect(findArraySpan(["A", "B"], "ABC")).toBeNull();
  });

  it("matches entire array", () => {
    expect(findArraySpan(["A", "B", "C"], "ABC")).toEqual([0, 2]);
  });

  it("handles array with empty strings", () => {
    expect(findArraySpan(["A", "", "B"], "AB")).toEqual([0, 2]);
    expect(findArraySpan(["", "", ""], "")).toEqual([0, 0]);
  });

  it("returns null for both array and target empty", () => {
    expect(findArraySpan([], "")).toBeNull();
  });

  it("handles overlapping matches", () => {
    expect(findArraySpan(["A", "B", "A", "B"], "ABAB")).toEqual([0, 3]);
  });
});

describe("wordsAndCorrectionsToSpans", () => {
  const mkCorrection = (
    original: string,
    correction = "FIX",
    explanation = "EXPL"
  ) => ({ original, correction, explanation });

  it("returns all words as a single span if no corrections", () => {
    expect(wordsAndCorrectionsToSpans(["A", "B", "C"], [])).toEqual([
      { words: ["A", "B", "C"] },
    ]);
  });

  it("returns a single corrected span", () => {
    const corrections = [mkCorrection("AB")];
    expect(wordsAndCorrectionsToSpans(["A", "B", "C"], corrections)).toEqual([
      { words: ["A", "B"], correction: corrections[0] },
      { words: ["C"] },
    ]);
  });

  it("returns multiple corrected and uncorrected spans", () => {
    const corrections = [mkCorrection("AB"), mkCorrection("C")];
    expect(wordsAndCorrectionsToSpans(["A", "B", "C"], corrections)).toEqual([
      { words: ["A", "B"], correction: corrections[0] },
      { words: ["C"], correction: corrections[1] },
    ]);
  });

  it("returns uncorrected spans between corrections", () => {
    const corrections = [mkCorrection("A"), mkCorrection("C")];
    expect(wordsAndCorrectionsToSpans(["A", "B", "C"], corrections)).toEqual([
      { words: ["A"], correction: corrections[0] },
      { words: ["B"] },
      { words: ["C"], correction: corrections[1] },
    ]);
  });

  it("ignores corrections that do not match any span", () => {
    const corrections = [mkCorrection("X")];
    expect(wordsAndCorrectionsToSpans(["A", "B", "C"], corrections)).toEqual([
      { words: ["A", "B", "C"] },
    ]);
  });

  it("handles overlapping corrections (first found wins)", () => {
    const corrections = [mkCorrection("AB"), mkCorrection("BC")];
    // Only the first correction will be applied, then the rest is uncorrected
    expect(wordsAndCorrectionsToSpans(["A", "B", "C"], corrections)).toEqual([
      { words: ["A", "B"], correction: corrections[0] },
      { words: ["C"] },
    ]);
  });

  it("handles corrections at the end", () => {
    const corrections = [mkCorrection("BC")];
    expect(wordsAndCorrectionsToSpans(["A", "B", "C"], corrections)).toEqual([
      { words: ["A"] },
      { words: ["B", "C"], correction: corrections[0] },
    ]);
  });

  it("handles empty words array", () => {
    expect(wordsAndCorrectionsToSpans([], [mkCorrection("A")])).toEqual([]);
  });
});

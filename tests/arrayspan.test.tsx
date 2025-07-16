import { describe, expect, it } from "vitest";
import { findArraySpan } from "../lib/arrayspan";

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

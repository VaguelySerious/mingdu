import { describe, expect, it, vi } from "vitest";
import { PipeBuffer } from "../ai/pipebuffer";

describe("PipeBuffer", () => {
  it("accumulates words from a single chunk with multiple words", async () => {
    const pb = new PipeBuffer();
    await pb.processChunk("我|觉得|今天|的|");
    expect(pb.wordAccumulator).toEqual(["我", "觉得", "今天", "的"]);
  });

  it("handles chunked input across multiple processChunk calls", async () => {
    const pb = new PipeBuffer();
    await pb.processChunk("我|觉得|今");
    await pb.processChunk("天|的|天");
    await pb.processChunk("气|");
    expect(pb.wordAccumulator).toEqual(["我", "觉得", "今天", "的", "天气"]);
  });

  it("flush emits the last word if not followed by |", async () => {
    const pb = new PipeBuffer();
    await pb.processChunk("我|觉得|今天|的|天");
    await pb.flush();
    expect(pb.wordAccumulator).toEqual(["我", "觉得", "今天", "的", "天"]);
  });

  it("calls onWord callback for each word", async () => {
    const onWord = vi.fn();
    const pb = new PipeBuffer(onWord);
    await pb.processChunk("我|觉得|今");
    await pb.processChunk("天|的|");
    expect(onWord).toHaveBeenCalledTimes(4);
    expect(onWord).toHaveBeenNthCalledWith(1, "我");
    expect(onWord).toHaveBeenNthCalledWith(2, "觉得");
    expect(onWord).toHaveBeenNthCalledWith(3, "今天");
    expect(onWord).toHaveBeenNthCalledWith(4, "的");
  });

  it("does nothing if no | is present in chunk", async () => {
    const pb = new PipeBuffer();
    await pb.processChunk("没有分隔符");
    expect(pb.wordAccumulator).toEqual([]);
    await pb.flush();
    expect(pb.wordAccumulator).toEqual(["没有分隔符"]);
  });

  it("handles chunk with only | as a word separator", async () => {
    const pb = new PipeBuffer();
    await pb.processChunk("|");
    expect(pb.wordAccumulator).toEqual([""]);
  });
});

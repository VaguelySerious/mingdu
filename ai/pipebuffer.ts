export const SPLIT_EXAMPLES = [
  `Examples for responses given user input:`,
  `"我觉得今天的天气很好，但是有点热" -> 我|觉得|今天|的|天气|很|好|，|但是|有点|热|。`,
  `"你好，我叫约翰" -> 你好|，|我|叫|约翰`,
  `"谢谢你" -> 谢谢|你`,
  `"我今天很开心" -> 我|今天|很|开心|。`,
  `"我很高兴认识你" -> 我|很|高兴|认识|你`,
].join("\n");

export class PipeBuffer {
  public wordAccumulator: string[] = [];
  private tempBuffer = "";
  private onWord?: (word: string) => void;

  constructor(onWord?: (word: string) => void) {
    this.onWord = onWord;
  }

  async processChunk(text: string) {
    this.tempBuffer += text;
    if (!this.tempBuffer.includes("|")) {
      return;
    }
    // We need to manually split chunks into words
    const words = this.tempBuffer.split("|");
    const firstWords = words.slice(0, -1);
    const finalWord = words[words.length - 1];
    this.tempBuffer = finalWord;

    for (const word of firstWords) {
      this.wordAccumulator.push(word);
      this.onWord?.(word);
    }
  }

  async flush() {
    // This is to get the last word out of the buffer
    if (this.tempBuffer) {
      this.wordAccumulator.push(this.tempBuffer);
      this.onWord?.(this.tempBuffer);
      this.tempBuffer = "";
    }
  }
}

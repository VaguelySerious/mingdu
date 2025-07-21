export const SPLIT_WORDS_PROMPT = [
  `You always split words in your response by pipes ("|"), so the student can more easily look up the words in a dictionary.`,
  `For any non-Mandarin text chunk, you return words as-is following original whitespace, e.g. splitting on spaces`,
  `for romanized text, e.g. "你好 my name is John" should be split into "你好|my|name|is|John".`,
  `Remember the point is to split words in a way where every word can be looked up in a regular dictionary,`,
  `so don't chunk proper nouns into single characters unless they're common words.`,
  `Examples for responses given user input:`,
  `"我觉得今天的天气很好，但是有点热" -> 我|觉得|今天|的|天气|很|好|，|但是|有点|热|。`,
  `"你好，我叫约翰" -> 你好|，|我|叫|约翰`,
  `"谢谢你" -> 谢谢|你`,
  `"我今天很开心" -> 我|今天|很|开心|。`,
  `"我很高兴认识你" -> 我|很|高兴|认识|你`,
  `铭读老师 -> 铭读|老师`,
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

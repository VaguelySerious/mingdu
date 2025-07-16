import { getAIProvider, getProviderType, ModelType } from "@/ai/provider";
import { streamText } from "ai";
import { PipeBuffer, SPLIT_EXAMPLES } from "./pipebuffer";

const SPLIT_SYSTEM_PROMPT = [
  `You're a Mandarin language model, designed to parse text into separate words.`,
  `You only respond to Mandarin text, and you answer with the same Mandarin text, split into individual words.`,
  `You always split words in your response by pipes ("|").`,
  `For any non-Mandarin text chunk, you return words as-is following original whitespace, e.g. splitting on spaces`,
  `for romanized text, e.g. "你好 my name is John" should be split into "你好|my|name|is|John".`,
  `\n${SPLIT_EXAMPLES}`,
].join(" ");

const TEMPERATURE = 0;

export const splitTextRequest = (
  modelId: ModelType,
  inputMessage: string,
  onWord?: (word: string) => void
): Promise<string[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const pipeBuffer = new PipeBuffer(onWord);
      const provider = getProviderType(modelId);
      const { textStream } = streamText({
        model: getAIProvider(provider, modelId),
        system: SPLIT_SYSTEM_PROMPT,
        messages: [{ role: "user", content: inputMessage }],
        temperature: TEMPERATURE,
        onError: (error) => {
          reject(error);
        },
      });

      for await (const text of textStream) {
        await pipeBuffer.processChunk(text);
      }
      await pipeBuffer.flush();
      resolve(pipeBuffer.wordAccumulator);
    } catch (e) {
      reject(e);
    }
  });
};

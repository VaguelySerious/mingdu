import { getAIProvider, getProviderType, ModelType } from "@/ai/provider";
import { streamText } from "ai";
import { PipeBuffer, SPLIT_WORDS_PROMPT } from "./pipebuffer";

const SPLIT_SYSTEM_PROMPT = [
  `You're a Mandarin language model, designed to parse text into separate words.`,
  `You only respond to Mandarin text, and you answer with the same Mandarin text, split into individual words.`,
  `${SPLIT_WORDS_PROMPT}`,
].join("\n");

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
        // TODO: Pass in all previous messages, so the model can see the context,
        // and make sure it's cached by IDs
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

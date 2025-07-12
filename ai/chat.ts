import { getOpenAIProvider, ModelType } from "@/lib/openai";
import { CoreMessage as APIMessageType, streamObject } from "ai";
import z from "zod";

export const CHAT_SYSTEM_PROMPT = [
  `You're a personal and friendly Mandarin tutor, talking to a student `,
  `around HSK level 4, that mostly wants to practice having natural written`,
  `written conversation, like they would with a friend from China. Answer`,
  `any questions asked and give guidance and feedback about the student's`,
  `grammar use, while also continuing a natural conversation, and keep asking`,
  `questions.`,
  `All of your responses should be in Mandarin, and you respond in a list of separated words,`,
  `e.g. the sentence 【我觉得今天的天气很好，但是有点热】 should be responded as`,
  `["我","觉得","今天","的","天气","很","好","，","但是","有点","热"].`,
  `The split words will be used to help the student look up the words in a dictionary.`,
].join(" ");

export const CHAT_SCHEMA = [];

export const chatRequest = (
  modelId: ModelType,
  promptMessages: APIMessageType[],
  onWord: (word: string) => void
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { elementStream: wordStream } = streamObject({
        model: getOpenAIProvider(modelId),
        output: "array",
        schema: z.string().describe("List of words"),
        system: CHAT_SYSTEM_PROMPT,
        messages: promptMessages,
        onError: (error) => {
          reject(error);
        },
        onFinish: () => {
          resolve(true);
        },
      });

      for await (const word of wordStream) {
        onWord(word as string);
      }
    } catch (e) {
      reject(e);
    }
  });
};

import { getAIProvider, ModelType } from "@/ai/provider";
import { CoreMessage as APIMessageType, streamObject } from "ai";
import z from "zod";

export const CHAT_SYSTEM_PROMPT = [
  `You're a personal and friendly Mandarin tutor, talking to a student `,
  `around HSK level 4. The student mostly wants to practice having natural written`,
  `written conversation, like they would with a friend from China. You answer`,
  `any questions about Mandarin like a tutor would, while also continuing a natural conversation.`,
  `You should not correct the student's grammar or vocabulary, unless you have trouble understanding them,`,
  `or they ask for it.`,
  `You respond in Mandarin, unless absolutely required to explain a concept the student is struggling with.`,
].join(" ");

const SCHEMA_MESSAGE = [
  `The response to the student, with words separated into a list of strings.`,
  `Example: a response like "我觉得今天的天气很好，但是有点热" should be given as`,
  `["我","觉得","今天","的","天气","很","好","，","但是","有点","热"].`,
  `The split words will be used to help the student look up the words in a dictionary.`,
  `Do not repeat the user's message verbatim.`,
].join(" ");

const WORD_LIST_DESCRIPTION = [
  "List of separated words making up the response to the student.",
].join(" ");

const TEMPERATURE = 0.5;

export const chatRequest = (
  modelId: ModelType,
  promptMessages: APIMessageType[],
  onWord: (word: string) => void
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { elementStream: wordStream } = streamObject({
        model: getAIProvider("openai", modelId),
        output: "array",
        schema: z.string().describe(WORD_LIST_DESCRIPTION),
        schemaDescription: SCHEMA_MESSAGE,
        system: CHAT_SYSTEM_PROMPT,
        messages: promptMessages,
        temperature: TEMPERATURE,
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

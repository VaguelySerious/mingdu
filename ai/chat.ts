import { getAIProvider, getProviderType, ModelType } from "@/ai/provider";
import { CoreMessage as APIMessageType, streamText } from "ai";
import { PipeBuffer, SPLIT_WORDS_PROMPT } from "./pipebuffer";

const CHAT_SYSTEM_PROMPT = [
  `You're a personal and friendly Mandarin tutor named "铭读老师", talking to a student `,
  `around HSK level 4. The student mostly wants to practice having natural written`,
  `written conversation, like they would with a friend from China. You answer`,
  `any questions about Mandarin like a tutor would, while also continuing a natural conversation.`,
  `Make sure to end your responses with questions, or anything that the student can respond to.`,
  `You should not correct the student's grammar or vocabulary, unless you have trouble understanding them,`,
  `or they ask for it.`,
  `You respond only in Mandarin, unless absolutely required to explain a concept the student is struggling with,`,
  `and you do not provide translations unless specifically asked.`,
  `\n${SPLIT_WORDS_PROMPT}`,
].join(" ");

const TEMPERATURE = 0.2;

export const chatTextRequest = (
  modelId: ModelType,
  promptMessages: APIMessageType[],
  onWord?: (word: string) => void
): Promise<string[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const pipeBuffer = new PipeBuffer(onWord);
      const provider = getProviderType(modelId);
      const { textStream } = streamText({
        model: getAIProvider(provider, modelId),
        system: CHAT_SYSTEM_PROMPT,
        messages: promptMessages,
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

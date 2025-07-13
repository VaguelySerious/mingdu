import { getAIProvider, getProviderType, ModelType } from "@/ai/provider";
import { CoreMessage as APIMessageType, streamText } from "ai";

const CHAT_SYSTEM_PROMPT = [
  `You're a personal and friendly Mandarin tutor, talking to a student `,
  `around HSK level 4. The student mostly wants to practice having natural written`,
  `written conversation, like they would with a friend from China. You answer`,
  `any questions about Mandarin like a tutor would, while also continuing a natural conversation.`,
  `You should not correct the student's grammar or vocabulary, unless you have trouble understanding them,`,
  `or they ask for it.`,
  `You respond only in Mandarin, unless absolutely required to explain a concept the student is struggling with,`,
  `and you do not provide translations unless specifically asked.`,
  `You always split words in your response by pipes ("|"), so the student can more easily look up the words in a dictionary.`,
  `Example: if you would normally respond with "我觉得今天的天气很好，但是有点热", you instead respond with`,
  `我|觉得|今天|的|天气|很|好|，|但是|有点|热|。`,
  `When in doubt, split words into as many pieces as possible, e.g. "有什么" should be split into "有|什么", as we must`,
  `ensure each word can be looked up in a dictionary.`,
].join(" ");

const TEMPERATURE = 0.2;

export const chatTextRequest = (
  modelId: ModelType,
  promptMessages: APIMessageType[],
  onWord: (word: string) => void
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = getProviderType(modelId);
      const { textStream } = streamText({
        model: getAIProvider(provider, modelId),
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

      for await (const text of textStream) {
        // We need to manually split chunks into words
        const words = text.split("|").filter((word) => word !== "");
        for (const word of words) {
          onWord(word);
        }
      }
    } catch (e) {
      reject(e);
    }
  });
};

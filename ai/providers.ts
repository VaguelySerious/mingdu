import { createOpenAI } from "@ai-sdk/openai";
import { customProvider } from "ai";

const openAi = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const languageModels = {
  "gpt-4.1-nano": openAi("gpt-4.1-nano"),
  "gpt-4.1-mini": openAi("gpt-4.1-mini"),
  "gpt-4.1": openAi("gpt-4.1"),
  "gpt-4o": openAi("gpt-4o"),
  "gpt-4o-mini": openAi("gpt-4o-mini"),
};

export const model = customProvider({
  languageModels,
});

export type ModelIDType = keyof typeof languageModels;

export const MODELS = Object.keys(languageModels) as ModelIDType[];

export const defaultModelId: ModelIDType = MODELS[3];

export const defaultModel = languageModels[defaultModelId];

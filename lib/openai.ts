import { createOpenAI } from "@ai-sdk/openai";

export enum ModelType {
  GPT_4_1_NANO = "gpt-4.1-nano",
  GPT_4_1_MINI = "gpt-4.1-mini",
  GPT_4_1 = "gpt-4.1",
  GPT_4O = "gpt-4o",
  GPT_4O_MINI = "gpt-4o-mini",
}

export const defaultModelId = ModelType.GPT_4_1_MINI;

export const getOpenAIKey = () => {
  try {
    return localStorage.getItem("OPENAI_API_KEY");
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const setOpenAIKey = (key: string) => {
  try {
    localStorage.setItem("OPENAI_API_KEY", key);
  } catch (e) {
    console.error(e);
  }
};

export const promptForOpenAIKey = () => {
  const key = prompt(
    "Enter your OpenAI API key. It'll be stored in browser localStorage."
  );
  if (key) {
    setOpenAIKey(key);
    return key;
  }
};

export const getOpenAIProvider = (modelId?: ModelType) => {
  return createOpenAI({
    apiKey: getOpenAIKey() ?? "",
  }).chat(modelId ?? defaultModelId);
};

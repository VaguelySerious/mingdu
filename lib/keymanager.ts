import { defaultModelId, ModelIDType } from "@/ai/providers";
import { createOpenAI } from "@ai-sdk/openai";

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

export const getOpenAIProvider = (modelId?: ModelIDType) => {
  return createOpenAI({
    apiKey: getOpenAIKey() ?? "",
  }).chat(modelId ?? defaultModelId);
};

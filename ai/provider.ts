import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";

export type ProviderType = "openai" | "anthropic";

export const isAnthropicModel = (modelId: string) => {
  return modelId.startsWith("claude");
};

export const isOpenAIModel = (modelId: string) => {
  return modelId.startsWith("gpt");
};

export const getProviderType = (modelId: string) => {
  if (isAnthropicModel(modelId)) {
    return "anthropic";
  } else if (isOpenAIModel(modelId)) {
    return "openai";
  }
  throw new Error(`Invalid model: ${modelId}`);
};

export enum ModelType {
  // OpenAI
  GPT_4_1_NANO = "gpt-4.1-nano",
  GPT_4_1_MINI = "gpt-4.1-mini",
  GPT_4_1 = "gpt-4.1",
  GPT_4O = "gpt-4o",
  GPT_4O_MINI = "gpt-4o-mini",

  // Anthropic
  CLAUDE_3_HAIKU = "claude-3-haiku-20240307",
  CLAUDE_3_5_HAIKU = "claude-3-5-haiku-latest",
  CLAUDE_4_SONNET = "claude-sonnet-4-0",
  CLAUDE_4_OPUS = "claude-opus-4-0",
}

export const defaultModelId = ModelType.GPT_4_1_NANO;
export const getAIKey = (provider: "openai" | "anthropic") => {
  try {
    return localStorage.getItem(`${provider}_API_KEY`);
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const hasAIKey = (provider: "openai" | "anthropic") => {
  return !!getAIKey(provider);
};

export const getOrPromptAIKey = (provider: "openai" | "anthropic") => {
  const key = getAIKey(provider);
  if (key) {
    return key;
  }

  const newKey = prompt(
    `Enter your ${provider} API key. It'll be stored in browser localStorage.`
  );
  if (newKey) {
    setAIKey(provider, newKey);
    return newKey;
  }
  throw new Error(`No API key provided for ${provider}`);
};

export const setAIKey = (provider: "openai" | "anthropic", key: string) => {
  try {
    localStorage.setItem(`${provider}_API_KEY`, key);
  } catch (e) {
    console.error(e);
  }
};

export const getAIProvider = (provider: ProviderType, modelId?: ModelType) => {
  if (provider === "openai") {
    return createOpenAI({
      apiKey: getOrPromptAIKey("openai") ?? "",
    }).chat(modelId ?? defaultModelId);
  } else if (provider === "anthropic") {
    return createAnthropic({
      apiKey: getOrPromptAIKey("anthropic") ?? "",
      headers: {
        "anthropic-dangerous-direct-browser-access": "true",
      },
    }).languageModel(modelId ?? defaultModelId);
  } else {
    throw new Error(`Invalid provider: ${provider}`);
  }
};

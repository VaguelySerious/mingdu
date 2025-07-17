import { getAIProvider, getProviderType, ModelType } from "@/ai/provider";
import { generateObject, streamObject } from "ai";
import z from "zod";

export const generateRecipeRequest = async (modelId: ModelType) => {
  return new Promise(async (resolve, reject) => {
    try {
      const model = getAIProvider(getProviderType(modelId), modelId);
      const { object } = await generateObject({
        model,
        schema: z.object({
          recipe: z.object({
            name: z.string(),
            ingredients: z.array(z.string()),
            steps: z.array(z.string()),
          }),
        }),
        prompt: "Generate a concise lasagna recipe.",
      });
      console.debug("object", object);
    } catch (e) {
      reject(e);
    }
  });
};

export const streamRecipeRequest = async (modelId: ModelType) => {
  return new Promise(async (resolve, reject) => {
    try {
      const model = getAIProvider(getProviderType(modelId), modelId);
      const { partialObjectStream } = streamObject({
        model,
        schema: z.object({
          recipe: z.object({
            name: z.string(),
            ingredients: z.array(z.string()),
            steps: z.array(z.string()),
          }),
        }),
        onFinish: (object) => {
          console.debug("recipe object done", object);
        },
        prompt: "Generate a lasagna recipe.",
      });
      for await (const partialObject of partialObjectStream) {
        console.debug("recipe partialObject", partialObject);
      }
    } catch (e) {
      reject(e);
    }
  });
};

export const streamRecipeArrayRequest = async (modelId: ModelType) => {
  return new Promise(async (resolve, reject) => {
    try {
      const model = getAIProvider(getProviderType(modelId), modelId);
      const { elementStream } = streamObject({
        model,
        output: "array",
        schema: z.object({
          ingredient: z.string().describe("The name of the ingredient"),
          quantity: z.string().describe("The quantity of the ingredient"),
          unit: z.string().describe("The unit of the ingredient"),
        }),
        onFinish: (object) => {
          console.debug("recipe array object done", object);
        },
        prompt: "Generate 10 ingredients for a lasagna recipe.",
      });
      for await (const element of elementStream) {
        console.debug("recipe element", element);
      }
    } catch (e) {
      reject(e);
    }
  });
};

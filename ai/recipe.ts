import { getAIProvider, getProviderType, ModelType } from "@/ai/provider";
import { generateObject } from "ai";
import z from "zod";

export const recipeRequest = async (modelId: ModelType) => {
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
        prompt: "Generate a lasagna recipe.",
      });
      console.debug("object", object);
    } catch (e) {
      reject(e);
    }
  });
};

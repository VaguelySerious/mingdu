import { getAIProvider, getProviderType, ModelType } from "@/ai/provider";
import { generateObject } from "ai";
import z from "zod";

export const recipeRequest = async (modelId: ModelType) => {
  return new Promise(async (resolve, reject) => {
    try {
      const _modelId = modelId;
      const model = getAIProvider(getProviderType(_modelId), _modelId);
      const { object } = await generateObject({
        model,
        schema: z.object({
          recipe: z.object({
            name: z.string(),
            ingredients: z.array(
              z.object({ name: z.string(), amount: z.string() })
            ),
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

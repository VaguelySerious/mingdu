import { getAIProvider, getProviderType, ModelType } from "@/ai/provider";
import { generateObject } from "ai";
import z from "zod";

export const recipeRequest = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const _modelId = ModelType.CLAUDE_3_5_HAIKU;
      const model = getAIProvider(getProviderType(_modelId), _modelId);
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

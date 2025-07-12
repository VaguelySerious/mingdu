"use client";
import {
  getAIKey,
  hasAIKey,
  isAnthropicModel,
  isOpenAIModel,
  ModelType,
} from "@/ai/provider";
import { useChatStore } from "@/lib/store";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export const ModelPicker = () => {
  const selectedModelId = useChatStore((state) => state.selectedModelId);
  const setSelectedModelId = useChatStore((state) => state.setSelectedModelId);

  const handleModelChange = (modelId: string) => {
    const missingKey =
      (isAnthropicModel(modelId) && !hasAIKey("anthropic")) ||
      (isOpenAIModel(modelId) && !hasAIKey("openai"));

    if (missingKey) {
      getAIKey(isAnthropicModel(modelId) ? "anthropic" : "openai");
    }
    setSelectedModelId(modelId as ModelType);
  };

  return (
    <div className="absolute p-4 bottom-2 left-2 flex flex-col gap-2">
      <Select value={selectedModelId} onValueChange={handleModelChange}>
        <SelectTrigger className="">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {Object.values(ModelType).map((modelId) => (
              <SelectItem key={modelId} value={modelId}>
                {modelId}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

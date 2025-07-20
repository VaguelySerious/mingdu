"use client";

import {
  getOrPromptAIKey,
  getProviderType,
  hasAIKey,
  isAnthropicModel,
  ModelType,
} from "@/ai/provider";
import { useChatStore } from "@/lib/store";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export const ModelPicker = () => {
  const [, setRerender] = useState(0); // force rerender after key change
  const selectedModelId = useChatStore((state) => state.selectedModelId);
  const setSelectedModelId = useChatStore((state) => state.setSelectedModelId);

  const providers = [
    { id: "openai", label: "OpenAI" },
    { id: "anthropic", label: "Anthropic" },
  ];

  const handleProviderClick = (provider: "openai" | "anthropic") => {
    if (hasAIKey(provider)) {
      // Remove key
      localStorage.removeItem(`${provider}_API_KEY`);
      setRerender((x) => x + 1);
    } else {
      getOrPromptAIKey(provider); // prompts and sets
      setRerender((x) => x + 1);
    }
  };

  const handleModelChange = (modelId: string) => {
    const provider = getProviderType(modelId);
    const missingKey = !hasAIKey(provider);

    if (missingKey) {
      getOrPromptAIKey(isAnthropicModel(modelId) ? "anthropic" : "openai");
    }
    setSelectedModelId(modelId as ModelType);
  };

  return (
    <Select value={selectedModelId} onValueChange={handleModelChange}>
      <SelectTrigger className="text-black w-full">
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {Object.values(ModelType).map((modelId) => (
            <SelectItem key={modelId} value={modelId}>
              {!hasAIKey(getProviderType(modelId)) && (
                <Tooltip>
                  <TooltipTrigger>
                    <span className="text-red-500">❌</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    No API key stored for this provider. Click to add your key.
                  </TooltipContent>
                </Tooltip>
              )}
              Model: {modelId}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

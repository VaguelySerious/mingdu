"use client";

import {
  getAIKey,
  hasAIKey,
  isAnthropicModel,
  isOpenAIModel,
  ModelType,
} from "@/ai/provider";
import { useChatStore } from "@/lib/store";
import { cn } from "@/lib/utils";
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
      getAIKey(provider); // prompts and sets
      setRerender((x) => x + 1);
    }
  };

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
      {/* Provider status bar */}
      <div className="flex flex-col gap-4 px-3 text-sm">
        {providers.map((p) => {
          const hasKey = hasAIKey(p.id as "openai" | "anthropic");
          return (
            <Tooltip key={p.id}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "flex items-center gap-1 cursor-pointer relative"
                  )}
                  onClick={() =>
                    handleProviderClick(p.id as "openai" | "anthropic")
                  }
                >
                  <span>{p.label}</span>
                  <span>{hasKey ? "✅" : "❌"}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent sideOffset={8}>
                {hasKey
                  ? "You have an API key stored for this provider. Click to remove."
                  : "No API key stored for this provider. Click to add your key."}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
      {/* Model picker */}
      <Select value={selectedModelId} onValueChange={handleModelChange}>
        <SelectTrigger className="text-black">
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

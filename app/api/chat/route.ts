import { model, type modelID } from "@/ai/providers";
import { streamText, type UIMessage } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    selectedModel,
  }: { messages: UIMessage[]; selectedModel: modelID } = await req.json();

  const result = streamText({
    model: model.languageModel(selectedModel),
    system:
      "Please act as my persona Mandarin tutor. I'm studying for the HSK 4, but I want to mostly practice having natural written conversation, like I would over text with someone from China. I might ask you to do things, but also feel free to ask me questions and offer corrections.",
    messages,
    // tools: {
    //   getWeather: weatherTool,
    // },
    experimental_telemetry: {
      isEnabled: true,
    },
  });

  return result.toDataStreamResponse({
    sendReasoning: true,
    getErrorMessage: (error) => {
      if (error instanceof Error) {
        if (error.message.includes("Rate limit")) {
          return "Rate limit exceeded. Please try again later.";
        }
      }
      console.error(error);
      return "An error occurred.";
    },
  });
}

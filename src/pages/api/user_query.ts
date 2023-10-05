// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAIStream, StreamingTextResponse } from "ai";
import dotenv from "dotenv";
import OpenAI from "openai";
import { CreateChatCompletionRequestMessage } from "openai/resources/chat";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

const correctionPromptFromConversation = (
  conversation: string,
  query: string,
  level: number = 1,
  useSimplifiedCharacters: boolean = true
) => {
  return `I'm currently studying Mandarin for HSK level ${level} using
${useSimplifiedCharacters ? "simplified" : "traditional"} Chinese characters.

${conversation}

To which I think the answer is: ${query}

Correct my answer on this. Only speak in Mandarin.
If it's already correct or mostly correct, only respond with "正确" and nothing else`;
};

const naturalityPromptFromConversation = (
  conversation: string,
  query: string,
  level: number = 1,
  useSimplifiedCharacters: boolean = true
) => {
  return `I'm currently studying Mandarin for HSK level ${level} using
${useSimplifiedCharacters ? "simplified" : "traditional"} Chinese characters.

${conversation}

In this context, consider the following sentence: ${query}

Help me make it sound more natural.
Please only speak in Mandarin and only respond with the more natural version.
If it already sounds natural, respond with "一定很自然" and nothing else.
Don't consider whether the sentence applies to the story, consider it in isolation.`;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  if (
    !req.query ||
    typeof req.query.query !== "string" ||
    typeof req.query.level !== "string" ||
    typeof req.query.naturality !== "string"
  ) {
    return res
      .status(400)
      .json("Bad Request, make sure query, level, and naturality are sent.");
  }
  if (
    typeof !req.body?.conversation === "string" ||
    !req.body?.OPENAI_API_KEY
  ) {
    return res
      .status(400)
      .json("Bad Request, make sure conversation and OPENAI_API_KEY is sent.");
  }

  const model =
    typeof req.query.model === "string" ? req.query.model : "gpt-3.5-turbo";

  try {
    const systemMessage = "You are a helpful Mandarin Chinese language tutor.";

    const promptFunction =
      req.query.naturality === "true"
        ? naturalityPromptFromConversation
        : correctionPromptFromConversation;

    const correctionMessage = promptFunction(
      req.body.conversation,
      req.query.query,
      Number(req.query.level)
    );
    const messages: CreateChatCompletionRequestMessage[] = [
      { role: "system", content: systemMessage },
      { role: "user", content: correctionMessage },
    ];

    const openai = new OpenAI({ apiKey: req.body.OPENAI_API_KEY });
    const openAiStream = await openai.chat.completions.create({
      model,
      messages,
      stream: true,
    });
    res.writeHead(200, {
      Connection: "keep-alive",
      "Content-Encoding": "none",
      "Cache-Control": "no-cache",
      "Content-Type": "text/event-stream",
    });
    for await (const part of openAiStream) {
      res.write(part.choices[0]?.delta?.content || "");
    }
    res.end();
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e.message);
  }
}

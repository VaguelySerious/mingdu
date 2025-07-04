// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import dotenv from "dotenv";
import OpenAI from "openai";
import { CreateChatCompletionRequestMessage } from "openai/resources/chat";
import {
  correctionPromptFromConversation,
  naturalityPromptFromConversation,
  newQuestionFromConversation,
  newStoryFromVocabulary,
} from "./prompts";
dotenv.config();

const QUERY_TYPE_TO_MESSAGE: Record<string, (req: NextApiRequest) => string> = {
  naturality: (req) => {
    if (typeof req.query.query !== "string") {
      throw {
        code: 400,
        message: "Bad Request, make sure 'query' is sent.",
      };
    }
    return naturalityPromptFromConversation(
      req.body.conversation,
      req.query.query,
      Number(req.query.level)
    );
  },
  correction: (req) => {
    if (typeof req.query.query !== "string") {
      throw {
        code: 400,
        message: "Bad Request, make sure 'query' is sent.",
      };
    }
    return correctionPromptFromConversation(
      req.body.conversation,
      req.query.query,
      Number(req.query.level)
    );
  },
  newQuestion: (req) => {
    return newQuestionFromConversation(
      req.body.conversation,
      Number(req.query.level)
    );
  },
  newStory: (req) => {
    return newStoryFromVocabulary(Number(req.query.level));
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  const supportedTypes = Object.keys(QUERY_TYPE_TO_MESSAGE);
  if (
    typeof req.query.type !== "string" ||
    !supportedTypes.includes(req.query.type)
  ) {
    return res
      .status(400)
      .json(
        `Bad Request, make sure 'type' is one of "${supportedTypes.join(
          '", "'
        )}".`
      );
  }

  if (
    typeof !req.body?.conversation === "string" ||
    !req.body?.OPENAI_API_KEY
  ) {
    return res
      .status(400)
      .json("Bad Request, make sure conversation and OPENAI_API_KEY is sent.");
  }

  try {
    const type = req.query.type;
    const message = QUERY_TYPE_TO_MESSAGE[type](req);
    const systemMessage = "You are a helpful Mandarin Chinese language tutor.";
    const messages: CreateChatCompletionRequestMessage[] = [
      { role: "system", content: systemMessage },
      { role: "user", content: message },
    ];

    const model =
      typeof req.query.model === "string" ? req.query.model : "gpt-3.5-turbo";
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
    if (typeof e === "object" && e && e.code) {
      return res.status(e.code).send(e.message);
    } else {
      console.error(e);
      res.status(500).send(e.message);
    }
  }
}

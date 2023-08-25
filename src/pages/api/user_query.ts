// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { ChatGPTAPI } from "chatgpt";
import dotenv from "dotenv";
dotenv.config();

const modelApi = new ChatGPTAPI({
  apiKey: process.env.OPENAI_API_KEY || "",
  debug: true,
  completionParams: {
    model: "gpt-4",
    // model: "gpt-3.5-turbo",
    // temperature: 0.5,
    // top_p: 0.8
  },
});

type Data =
  | {
      error: string;
    }
  | {
      text: string;
      id: string;
    };

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

Could you correct my answer on this? Please only speak in Mandarin to help me immerse.
If it's already correct or mostly correct, please just respond with "正确"`;
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

Do you think in this context, the following sentence sounds natural?

${query}

Could you help me make it sound more natural? Please only speak in Mandarin to help me immerse,
and only respond with the more natural version.
If it already sounds correct and natural, please just respond with "一定很自然"`;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (
    !req.query ||
    typeof req.query.query !== "string" ||
    typeof req.query.conversation !== "string" ||
    typeof req.query.level !== "string" ||
    typeof req.query.naturality !== "string"
  ) {
    return res.status(400).json({ error: "Bad Request" });
  }

  try {
    const systemMessage =
      "You are a helpful Mandarin Chinese language AI tutor.";

    const promptFunction =
      req.query.naturality === "true"
        ? naturalityPromptFromConversation
        : correctionPromptFromConversation;

    const correctionMessage = promptFunction(
      req.query.conversation,
      req.query.query,
      Number(req.query.level)
    );
    const data = await modelApi.sendMessage(correctionMessage, {
      systemMessage,
    });

    return res.status(200).json({ text: data.text, id: data.id });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}

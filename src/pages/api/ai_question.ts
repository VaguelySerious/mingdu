import type { NextApiRequest, NextApiResponse } from "next";
import { ChatGPTAPI } from "chatgpt";
import dotenv from "dotenv";
dotenv.config();

type Data =
  | {
      error: string;
    }
  | {
      text: string;
      id: string;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (!req.query) {
    return res.status(400).json({ error: "Bad Request" });
  }
}

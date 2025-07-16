import { getAIProvider, getProviderType, ModelType } from "@/ai/provider";
import { streamObject } from "ai";
import z from "zod";
import { SPLIT_EXAMPLES } from "./pipebuffer";

const CORRECTION_SYSTEM_PROMPT = [
  `You're a Mandarin language tutor AI, designed to correct the student's Mandarin.`,
  `You search student input for any grammar and expressions that are not fluent Mandarin, and you correct them,`,
  `as a Mandarin tutor would, giving both the corrections and the explanations in Mandarin.`,
  `The student might be using unexpected words, or make mistakes when writing with an IME and mistyping pinyin.`,
  `Example: given the student input "谢谢你正我的句子。我刚刚的爱好是去公园骑一个电动独轮车。你知道那是什么吗？",`,
  `The following would be good corrections:\n`,
  `- "正我的句子" → "纠正我的句子", with explanation "正"这个字单独用不太自然，要用"纠正"或"改正"`,
  `- "我刚刚的爱好" → "我最近的爱好", with explanation "刚刚"是指刚才，"最近"更合适`,
  `- "骑一个电动独轮车" → "骑电动独轮车", with explanation 不需要"一个"`,
  `\nYou always split words in your response by pipes ("|"), so the student can more easily look up the words in a dictionary.`,
  `\n${SPLIT_EXAMPLES}`,
].join(" ");

const TEMPERATURE = 0.2;

const CORRECTION_SCHEMA = z.object({
  corrections: z.array(
    z.object({
      original: z
        .string()
        .describe(
          "Copy of the minimal original substring that needs correction."
        ),
      correction: z.string().describe("The corrected substring"),
      explanation: z
        .string()
        .describe(
          [
            `Additional information, using minimal Mandarin, answering questions`,
            `such as what makes this correction necessary, what would be other good examples, what would the uncorrected`,
            `text falsely convey?`,
          ].join(" ")
        ),
    })
  ),
});

type CorrectionItemType = z.infer<typeof CORRECTION_SCHEMA>;

export const correctionJsonRequest = (
  modelId: ModelType,
  userMessage: string,
  onCorrectionItem?: (correctionItem: CorrectionItemType) => void
): Promise<CorrectionItemType[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const model = getAIProvider(getProviderType(modelId), modelId);
      const { partialObjectStream } = await streamObject({
        model,
        system: CORRECTION_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: userMessage,
          },
        ],
        temperature: TEMPERATURE,
        schema: CORRECTION_SCHEMA,
        onError: (error) => {
          reject(error);
        },
        onFinish: (...args) => {
          console.debug("Finished", ...args);
        },
      });

      for await (const partialObject of partialObjectStream) {
        console.debug("partialObject", partialObject);
        onCorrectionItem?.(partialObject as CorrectionItemType);
      }
      console.debug("End of stream");
    } catch (e) {
      reject(e);
    }
  });
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const FAKE_CORRECTIONS = [
  {
    original: "我刚刚的爱好。",
    correction: "我最近的爱好。",
    explanation: `刚刚"是指刚才，"最近"更合适。`,
  },
  {
    original: "骑一个电动独轮车",
    correction: "骑电动独轮车",
    explanation: `不需要"一个"。`,
  },
];

export const fakeCorrectionJsonRequest = async (
  modelId: ModelType,
  userMessage: string,
  onCorrectionItem?: (correctionItem: CorrectionItemType) => void
): Promise<CorrectionItemType[]> => {
  await sleep(1000);
  onCorrectionItem?.({
    corrections: FAKE_CORRECTIONS.slice(0, 1),
  });
  await sleep(1000);
  onCorrectionItem?.({
    corrections: FAKE_CORRECTIONS,
  });
  await sleep(100);
  return [];
};

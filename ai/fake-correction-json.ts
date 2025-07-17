import { CorrectionZodItemType } from "./correction-json";
import { ModelType } from "./provider";

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
  onCorrectionItem?: (correctionItem: CorrectionZodItemType) => void
): Promise<CorrectionZodItemType[]> => {
  await sleep(1000);
  onCorrectionItem?.(FAKE_CORRECTIONS[0]);
  await sleep(1000);
  onCorrectionItem?.(FAKE_CORRECTIONS[1]);
  await sleep(100);
  return [];
};

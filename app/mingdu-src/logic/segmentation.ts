import { WordDictData } from "./dictionary";
import Init, { Gse } from "gse-wasm";
import Jieba from "js-jieba";
import { JiebaDict, HMMModel, UserDict, IDF, StopWords } from "jieba-zh-cn";

const jieba = Jieba(JiebaDict, HMMModel, UserDict, IDF, StopWords);

const wasmURL = "https://unpkg.com/gse-wasm/dist/gse.wasm";

let gse: Gse;

const isHanzi = (u: number) =>
  !isNaN(u) &&
  (u === 0x25cb ||
    (0x3400 <= u && u <= 0x9fff) ||
    (0xf900 <= u && u <= 0xfaff) ||
    (0xff21 <= u && u <= 0xff3a) ||
    (0xff41 <= u && u <= 0xff5a) ||
    (0xd800 <= u && u <= 0xdfff));

export const initWasm = async () => {
  const gseRes = await Init(wasmURL);
  gse = gseRes.gse;
  gse.Segmenter.LoadDict("zh");
  return gse;
};

export const gseWasmCut = (text: string) => {
  return gse.Segmenter.Cut(text);
};

export const segmentWithJieba = (text: string) => {
  return jieba.cut(text, true);
};

export const segmentByLongestDictionaryLookup = (
  text: string,
  wordDict: WordDictData
) => {
  const list = [] as string[];
  // Find the longest substring that is also a dictionary word
  for (let i = 0; i < text.length; i++) {
    const u = text.charCodeAt(i);
    if (!isHanzi(u) || !wordDict[text[i]]) {
      if (isHanzi(u) && !wordDict[text[i]]) {
        console.log("Missing dict data for", text[i]);
      }
      list.push(text[i]);
      continue;
    }
    let j = i + 1;
    let word = text.slice(i, j);
    while (j < text.length && isHanzi(text.charCodeAt(j))) {
      if (!wordDict[word + text[j]]) {
        break;
      }
      j++;
      word = text.slice(i, j);
    }
    list.push(word);
    i = j - 1;
  }
  return list;
};

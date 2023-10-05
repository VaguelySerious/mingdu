import { createContext } from "react";
import pinyinTool from "pinyin-tone";

export type WordDictData = Record<
  string,
  [definitions: [pinyin: string, translations: string[]][], hskLevel: number]
>;
export type HSKDictData = Record<string, number>;
export type GrammarDictData = Record<string, boolean>;
export type DictData = {
  wordDict: WordDictData;
  hskDict: HSKDictData;
  grammarDict: GrammarDictData;
};

export const DictContext = createContext(null as DictData | null);

let lastLog: Date | null = null;
const log = (...args: any[]) => {
  if (!lastLog) {
    lastLog = new Date();
    console.log(...args);
  } else {
    const now = new Date();
    const diff = now.getTime() - lastLog.getTime();
    lastLog = now;
    console.log(`+${diff}ms`, ...args);
  }
};

export const loadDictData = async (): Promise<DictData> => {
  log("Downloading data...");
  const [dict, grammar, hskLists] = await Promise.all([
    fetch("/data/cedict_ts.u8").then((r) => r.text()),
    fetch("/data/grammarKeywords.txt").then((r) => r.text()),
    fetch("/data/hskLists.txt").then((r) => r.text()),
    // fetch("/data/cedict.idx").then((r) => r.text()),
    // fetch("/data/vocabularyKeywords.txt").then((r) => r.text()),
  ]);

  log("Processing HSK levels");

  const hskDict: Record<string, number> = {};
  // TODO This shouldn't have to be reversed: instead remove duplicates directly from source
  hskLists
    .split("\n")
    .reverse()
    .map((line, i) =>
      line.split(",").map((word) => {
        hskDict[word] = 6 - i;
      })
    );

  log("Constructing custom dictionary");

  // A line in the dictionary looks like this: 陪產假 陪产假 [pei2 chan3 jia4] /paternity leave/
  // We want to split it by spaces, but not the spaces in the square brackets or between slashes.
  const wordDict = dict
    .split("\n")
    .filter((line) => !line.startsWith("#"))
    .reduce((acc, line) => {
      const noTrad = line.slice(line.indexOf(" ") + 1);
      const zh = noTrad.slice(0, noTrad.indexOf(" ["));
      const pinyin = pinyinTool(
        noTrad.slice(noTrad.indexOf("[") + 1, noTrad.indexOf("]")).toLowerCase()
      );
      const defs = noTrad
        .slice(noTrad.indexOf("] ") + 2)
        .split("/")
        .filter(Boolean);
      if (acc[zh]) {
        acc[zh][0].push([pinyin, defs]);
        return acc;
      } else {
        acc[zh] = [[[pinyin, defs]], hskDict[zh]];
      }
      return acc;
    }, {} as WordDictData);

  (window as any).wordDict = wordDict;
  (window as any).hskDict = hskDict;

  log("Done");

  return {
    wordDict,
    hskDict,
    grammarDict: grammar.split(",").reduce((acc, cur) => {
      acc[cur] = true;
      return acc;
    }, {} as Record<string, boolean>),
  };
};

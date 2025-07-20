import { loadDictData } from "@/lib/dictionary";
import { use } from "react";

export const DictionaryEntry = ({ word }: { word: string }) => {
  const dictData = use(loadDictData());
  const entry = dictData.dict?.[word];
  if (!entry) {
    return <div>{word}</div>;
  }
  return <div>{entry[0][0]}</div>;
};

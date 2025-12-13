import { loadDictData } from "@/lib/dictionary";
import { use } from "react";
import { HSKLevelBadge } from "../skill/HSKBadge";
import { SkillLevelBadge } from "../skill/SkillBadge";
import { useSkillLevel } from "../skill/use-skill";

type DictEntryMapType = {
  word: string;
  definitions: { pinyin: string; translations: string[] }[];
  hskLevel: number | undefined;
};

const entryToDictEntryMap = (
  word: string,
  entry?: [
    definitions: [pinyin: string, translations: string[]][],
    hskLevel: number
  ]
): DictEntryMapType => {
  if (!entry) {
    return {
      word,
      definitions: [
        {
          pinyin: "",
          translations: ["No dictionary entry found"],
        },
      ],
      hskLevel: undefined,
    };
  }
  return {
    word,
    definitions: entry[0].map((def) => ({
      pinyin: def[0],
      translations: def[1],
    })),
    hskLevel: entry[1],
  };
};

const WordEntry = ({
  word,
  entryMap,
}: {
  word: string;
  entryMap: DictEntryMapType;
}) => {
  // TODO: Toggle for simplified or traditional Chinese characters
  const definitions = entryMap.definitions;
  const { level, read, write } = useSkillLevel(word);

  return (
    <div className="flex items-start justify-between relative w-full">
      <div className="flex flex-col gap-2 w-full">
        {definitions.map((def, i) => (
          <div key={i} className="flex flex-col gap-1 items-start">
            <div className="flex gap-3 items-center">
              <span>{word}</span>
              <span>{def.pinyin}</span>
            </div>
            <div className="text-sm w-full whitespace-break-spaces">
              {def.translations.join(" | ")}
            </div>
          </div>
        ))}
      </div>

      <div className="absolute right-0 top-0">
        <SkillLevelBadge level={level} read={read} write={write} />
        {entryMap.hskLevel && <HSKLevelBadge level={entryMap.hskLevel} />}
      </div>
    </div>
  );
};

export const DictionaryEntry = ({ id, word }: { id: string; word: string }) => {
  const dictData = use(loadDictData());
  const entry = dictData.dict?.[word];
  const chars = word.split("");
  const subEntries = chars.map((char) => dictData.dict?.[char]);
  const mainEntryMap = entryToDictEntryMap(word, entry);
  const subEntryMaps = subEntries.map((subEntry, i) =>
    entryToDictEntryMap(chars[i], subEntry)
  );
  const entryMaps = [mainEntryMap, ...subEntryMaps];

  if (!entryMaps.some((entryMap) => entryMap.definitions.length)) {
    return <div>{word}: No dictionary entry found</div>;
  }

  // Word one-character words, we don't separately need to show main and sub-entry, since they're the same
  const validEntryMaps = word.length === 1 ? entryMaps.slice(1) : entryMaps;

  return (
    <div className="flex flex-col gap-1">
      {/* TODO: Add a button to show more entries */}
      {validEntryMaps.slice(0, 3).map((entryMap, i) => (
        <WordEntry
          key={`${id}-${i}`}
          word={entryMap.word}
          entryMap={entryMap}
        />
      ))}
    </div>
  );
};

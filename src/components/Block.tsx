import { DictContext } from "@/logic/dictionary";
import { flatten } from "lodash-es";
import {
  segmentWithJieba,
  segmentByLongestDictionaryLookup,
} from "@/logic/segmentation";
import { BlockType } from "@/types/block";
import clsx from "clsx";
import { useContext, useState } from "react";
import { Tooltip } from "react-tooltip";
import * as memory from "../logic/memory";

const typeToStyle: Record<BlockType["type"], string> = {
  user_question: "is-info",
  user_answer: "is-info",
  story: "is-primary",
  task: "is-success",
  ai_answer: "is-warning",
  system: "is-link",
};

const typeToTag: Record<BlockType["type"], string> = {
  user_question: "Your Question",
  user_answer: "Your Answer",
  story: "Story",
  task: "Question",
  ai_answer: "Answer",
  system: "System",
};

export const HoverableWord = ({
  word,
  wordIndex,
}: {
  word: string;
  wordIndex: number;
}) => {
  const dictionaries = useContext(DictContext);
  const [level, setLevel] = useState(memory.get(word) || 0);

  if (!dictionaries) {
    return <span>{word}</span>;
  }
  const lookup = dictionaries.wordDict[word];
  if (!lookup) {
    return <span>{word}</span>;
  }
  const [definitions, hskLevel] = lookup;

  const content = word;
  // // If the word doesn't have an hsk level, we color the characters individually
  // const content = hskLevel
  //   ? word
  //   : word.split("").map((c, i) => {
  //       let characterLookup = dictionaries.hskDict[c];
  //       if (!characterLookup) {
  //         // If the individual character isn't in HSK, we classify it by the first combined HSK word that contains it
  //         characterLookup = Math.min(
  //           ...Object.keys(dictionaries.hskDict)
  //             .filter((key) => key.includes(c))
  //             .map((key) => dictionaries.hskDict[key])
  //         );
  //       }
  //       return (
  //         <span key={i} className={clsx(`level-${characterLookup || "none"}`)}>
  //           {c}
  //         </span>
  //       );
  //     });

  return (
    <span
      className={clsx(definitions?.length && "word", `level-${level}`)}
      onClick={() => {
        const newLevel = level === 0 ? 5 : 0;
        memory.set(word, newLevel);
        setLevel(newLevel);
      }}
    >
      <Tooltip
        id={`${wordIndex}-${content}`}
        style={{ backgroundColor: "white" }}
      >
        <div className="dict-tooltip">
          {definitions.map(([pinyin, translations], i) => (
            <div key={i} className="dict-tooltip-definition">
              <div className="flex">
                <div className="dict-tooltip-word">{content}</div>
                <div className="dict-tooltip-pinyin">{pinyin}</div>
              </div>
              {translations?.length && (
                <div className="dict-tooltip-translations">
                  {translations.map((t, j) => (
                    <span
                      key={i + "-" + j}
                      className="dict-tooltip-translation"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Tooltip>
      <span data-tooltip-id={`${wordIndex}-${content}`}>{content}</span>
    </span>
  );
};

export const HoverableText = ({ text }: { text: string }) => {
  const wordDict = useContext(DictContext)?.wordDict;
  if (!wordDict) {
    return <span>{text}</span>;
  }

  const list = flatten(
    segmentWithJieba(text).map((word) =>
      wordDict[word] ? word : segmentByLongestDictionaryLookup(word, wordDict)
    )
  );

  return (
    <span>
      {list.map((word, i) => (
        <HoverableWord key={i} wordIndex={i} word={word} />
      ))}
    </span>
  );
};

export const Block = ({ block }: { block: BlockType }) => {
  return (
    <div className="chat-block">
      <div className="chat-block-content">
        <span className={clsx("tag", typeToStyle[block.type])}>
          {typeToTag[block.type]}
        </span>
        <span className={"-" + block.type}>
          <HoverableText text={block.text} />
        </span>
      </div>
      {block.correction && (
        <div className="chat-block-correction">
          <div className="chat-block-content">
            <span className="tag is-link">Improvement</span>
            <span>
              <HoverableText text={block.correction} />
            </span>
          </div>
        </div>
      )}
      {block.loading && (
        <div className="bot-right-float">
          <div className="loading-spinner"></div>
        </div>
      )}
      {block.completed && (
        <div className="bot-right-float">
          <span className="checkmark">
            <div className="checkmark_stem"></div>
            <div className="checkmark_kick"></div>
          </span>
        </div>
      )}
    </div>
  );
};

export default Block;

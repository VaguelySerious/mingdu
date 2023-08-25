import { BlockType } from "@/types/block";
import clsx from "clsx";

const typeToStyle: Record<BlockType["type"], string> = {
  user_question: "is-info",
  user_answer: "is-info",
  story: "is-primary",
  task: "is-success",
  ai_answer: "is-warning",
  ai_correction: "is-warning",
  ai_natural_correction: "is-warning",
  system: "is-link",
};

const typeToTag: Record<BlockType["type"], string> = {
  user_question: "Your Question",
  user_answer: "Your Answer",
  story: "Story",
  task: "Question",
  ai_answer: "Answer",
  ai_correction: "Correction",
  ai_natural_correction: "Improvement",
  system: "System",
};

export const Block = ({ block }: { block: BlockType }) => {
  return (
    <div className="chat-block">
      <span className={clsx("tag", typeToStyle[block.type])}>
        {typeToTag[block.type]}
      </span>
      <span className={"-" + block.type}>{block.text}</span>
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

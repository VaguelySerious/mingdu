import { DictContext } from "@/logic/dictionary";
import Image from "next/image";
import { useContext } from "react";
import * as memory from "../logic/memory";
import { BlockType, StoryType } from "@/types/block";
import clsx from "clsx";

const modelChoices = [
  {
    name: "GPT 3.5",
    value: "gpt-3.5-turbo",
  },
  {
    name: "GPT 4",
    value: "gpt-4",
  },
];

const levelChoices = [3, 4, 5, 6];

export const Sidebar = ({
  level,
  model,
  stories,
  blocks,
  onLevelChange,
  onModelChange,
  onStoryChange,
  onAddQuestion,
  onAddStory,
  onDeleteStory,
}: {
  level: number;
  model: string;
  stories: StoryType[];
  blocks: BlockType[];
  onLevelChange: (n: number) => void;
  onModelChange: (m: string) => void;
  onStoryChange: (si: number) => void;
  onDeleteStory: (si: number) => void;
  onAddQuestion: () => Promise<void>;
  onAddStory: () => Promise<void>;
}) => {
  const dictionaries = useContext(DictContext);
  const markAllAsKnown = (level: number) => {
    if (!dictionaries) return;
    Object.entries(dictionaries.hskDict).forEach(([word, wordLevel]) => {
      if (wordLevel === level) {
        memory.set(word, 5);
      }
    });
  };
  return (
    <div className="sidebar">
      <div className="sidebar-item sidebar-logo">
        <div className="sidebar-logo-text">MingDu</div>
        <Image width="64" height="64" src="/logo.png" alt="logo" />
      </div>
      <div className="sidebar-item sidebar-selectors">
        <div className="sidebar-selector select">
          <label htmlFor="levels">Level</label>
          <select
            name="levels"
            id="levels"
            value={level}
            onChange={(e) => onLevelChange(parseInt(e.target.value))}
          >
            {levelChoices.map((choice) => {
              return (
                <option key={`level-${choice}`} value={choice}>
                  HSK {choice}
                </option>
              );
            })}
          </select>
        </div>
        <div className="sidebar-selector select">
          <label htmlFor="models">Model</label>
          <select
            name="models"
            id="models"
            onChange={(e) => onModelChange(e.target.value)}
            value={model}
          >
            {modelChoices.map((choice) => {
              return (
                <option key={`model-${choice.value}`} value={choice.value}>
                  {choice.name}
                </option>
              );
            })}
          </select>
        </div>
      </div>
      <div className="sidebar-item sidebar-stories">
        {stories.map((story, i) => (
          <div
            key={story.id}
            className={clsx(
              "story hoverable",
              story.blocks === blocks && "selected"
            )}
          >
            <div className="story-text" onClick={() => onStoryChange(i)}>
              Story {i + 1}
            </div>
            <div
              className="revealed-on-hover story-delete"
              onClick={() => onDeleteStory(i)}
            >
              X
            </div>
          </div>
        ))}
        <div className="new" onClick={() => onAddStory()}>
          +
        </div>
      </div>
      <div className="sidebar-item sidebar-legend">
        {levelChoices.map((choice) => (
          <div
            key={choice}
            onClick={() => markAllAsKnown(choice)}
            className={`level-${choice - 1}`}
          >
            HSK {choice}
          </div>
        ))}
      </div>
      <div className="sidebar-item sidebar-buttons">
        <button className="button" onClick={onAddQuestion}>
          New Question
        </button>
      </div>
    </div>
  );
};

import { ChatInput } from "@/components/ChatInput";
import { Sidebar } from "@/components/Sidebar";
import { DictContext, DictData, loadDictData } from "@/logic/dictionary";
import { streamFetch } from "@/logic/do-fetch";
import { BlockType, StoryType } from "@/types/block";
import { useEffect, useState } from "react";
import { blocksToModelInput } from "../logic/block-parser";
import * as memory from "../logic/memory";
import { Chat } from "./Chat";

type ModelName = "gpt-3.5-turbo" | "gpt-4";

const defaultModel: ModelName = "gpt-3.5-turbo";

const NATURALITY_NOOP_ANSWER = "一定很自然。";
const CORRECTION_NOOP_ANSWER = "正确。";

const defaultBlocks: BlockType[] = [
  // {
  //   type: "system",
  //   text: [
  //     `Welcome to Mingdu, you personalized AI mandarin tutor. Begin the conversation by reading the`,
  //     `story below and answering the question asked at the end. You can also always ask questions about`,
  //     `the story or about anything else you want to learn about.`,
  //   ].join(" "),
  // },
  {
    type: "story",
    text: [
      `小明是一个很勤奋的学生。他每天都早早地起床，然后去学校上课。他在学校认真听老师讲课，做笔记。放学后，他会回家做作业。`,
      `他喜欢做数学题，因为数学对他来说很容易。他也很喜欢看书，尤其是有趣的故事书。晚上，他会花一些时间读书。`,
      `小明的父母都很骄傲他，因为他的努力和好成绩。`,
    ].join(" "),
  },
  {
    type: "task",
    text: `小明每天晚上都会做什么？`,
  },
];
const defaultStory = { id: 0, blocks: defaultBlocks };

const scrollChatToBottom = () =>
  setTimeout(() => {
    document.querySelector("#chat-window")?.scrollTo({
      top: 9999999999,
      behavior: "smooth",
    });
  }, 0);

/**
 * TODO:
 * - Scroll down to bottom of chat when new message appears
 * - blocks to model input
 * - model output to block
 * - Story generation button
 * - Extra question button
 * -
 */

let OPENAI_API_KEY = "";

export const App = () => {
  const [level, setLevel] = useState(3);
  const [model, setModel] = useState<ModelName>(defaultModel);
  const [blocks, setBlocks] = useState<BlockType[]>(defaultBlocks);
  const [isLoading, setLoading] = useState(false);
  const [dictionaries, setDictionaries] = useState<DictData | null>(null);
  const [stories, setStories] = useState<StoryType[]>([]);

  // TODO Fix issues with story blocks not being tracked well across things

  useEffect(() => {
    memory.load();
    loadDictData().then((data) => setDictionaries(data));
    OPENAI_API_KEY = memory.getOrPromptOpenAIKey();
    const _stories = memory.getJson("stories") || [defaultStory];
    setStories(_stories);
    setBlocks(_stories[0].blocks);
  }, []);

  useEffect(() => {
    memory.setJson("stories", stories);
  }, [stories]);

  const submitQuery = async (text: string) => {
    setLoading(true);
    const conversation = blocksToModelInput(blocks);
    const userBlock: BlockType = { loading: true, text, type: "user_answer" };
    blocks.push(userBlock);
    setBlocks([...blocks]);
    scrollChatToBottom();
    let naturalityCorrection = "";
    let differsFromCorrectionNoop = false;
    const correctionBlock: BlockType = {
      text: "",
      loading: true,
      type: "ai_answer",
    };

    // This corrects whatever the user wrote, independent of the story
    const naturalityRequest = streamFetch(
      `/api/user_query`,
      {
        level,
        query: text,
        type: "naturality",
        model,
      },
      { conversation, OPENAI_API_KEY },
      (str) => {
        naturalityCorrection += str;
        const differsFromNaturalityNoop =
          naturalityCorrection.length > NATURALITY_NOOP_ANSWER.length ||
          naturalityCorrection !==
            NATURALITY_NOOP_ANSWER.slice(0, naturalityCorrection.length);
        if (differsFromNaturalityNoop) {
          userBlock.correction = naturalityCorrection;
          setBlocks([...blocks]);
        }
      }
    )
      .then(() => {
        console.log(`Naturality text: "${naturalityCorrection}"`);
        userBlock.loading = false;
        setBlocks([...blocks]);
      })
      .catch((err) => {
        setBlocks([...blocks, { type: "system", text: String(err) }]);
      });

    // This reacts to the the user's query, dependent on the story
    const correctionRequest = streamFetch(
      `/api/user_query`,
      {
        type: "correction",
        level,
        query: text,
        model,
      },
      { conversation, OPENAI_API_KEY },
      (str) => {
        correctionBlock.text += str;
        differsFromCorrectionNoop =
          correctionBlock.text.length > CORRECTION_NOOP_ANSWER.length ||
          correctionBlock.text !==
            CORRECTION_NOOP_ANSWER.slice(0, correctionBlock.text.length);
        if (differsFromCorrectionNoop) {
          if (!blocks.includes(correctionBlock)) {
            blocks.push(correctionBlock);
            scrollChatToBottom();
          }
          setBlocks([...blocks]);
        }
      }
    )
      .then(() => {
        console.log(`Correction text: "${correctionBlock.text}"`);
        correctionBlock.loading = false;
        setBlocks([...blocks]);
        // TODO If it's an answer to a user question, shouldn't mark item as completed
        if (!differsFromCorrectionNoop) {
          userBlock.completed = true;
          onAddQuestion();
        }
        userBlock.loading = false;
        setLoading(false);
      })
      .catch((err) => {
        setBlocks([...blocks, { type: "system", text: String(err) }]);
      });

    await Promise.all([naturalityRequest, correctionRequest]);
  };

  const onAddStory = async () => {
    const newStoryId = stories.length;
    const storyBlock: BlockType = { loading: true, type: "story", text: "" };
    const newStory = { id: newStoryId, blocks: [storyBlock] };
    const newStories = [...stories, newStory];
    setStories(newStories);
    setBlocks(newStory.blocks);

    streamFetch(
      `/api/user_query`,
      { type: "newStory", level, model },
      { OPENAI_API_KEY },
      (str) => {
        storyBlock.text += str;
        setStories(newStories);
      }
    ).then(() => {
      storyBlock.loading = false;
      setStories(newStories);
      onAddQuestion();
    });
  };

  const onAddQuestion = async () => {
    const questionBlock: BlockType = { loading: true, type: "task", text: "" };
    const conversation = blocksToModelInput(
      blocks[blocks.length - 1].type === "task" ? blocks.slice(-1) : blocks
    );
    streamFetch(
      `/api/user_query`,
      { type: "newQuestion", level, model },
      { conversation, OPENAI_API_KEY },
      (str) => {
        questionBlock.text += str;
        if (!blocks.includes(questionBlock)) {
          blocks.push(questionBlock);
          scrollChatToBottom();
        }
        setStories([...stories]);
      }
    ).then(() => {
      questionBlock.loading = false;
      setStories([...stories]);

      if (
        blocks.filter((b) => b.type === "user_answer" && b.completed === true)
      ) {
        // TODO Mark story as "practiced"
        // TODO: Mark all words in the conversations as practiced.
      }
    });
  };

  return (
    <DictContext.Provider value={dictionaries}>
      <div className="page-container">
        <Sidebar
          level={level}
          model={model}
          stories={stories}
          blocks={blocks}
          onModelChange={(m) => setModel(m as ModelName)}
          onLevelChange={(l) => setLevel(l)}
          onStoryChange={(si) => setBlocks(stories[si].blocks)}
          onAddQuestion={onAddQuestion}
          onAddStory={onAddStory}
          onDeleteStory={(si) => setStories(stories.filter((_, i) => i !== si))}
        />
        <div className="page-main">
          <Chat blocks={blocks} isLoading={isLoading} />
          <ChatInput onSubmit={submitQuery} isLoading={isLoading} />
        </div>
      </div>
    </DictContext.Provider>
  );
};

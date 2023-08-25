import { useEffect, useState } from "react";
import { Chat } from "../components/Chat";
import * as memory from "../logic/memory";
import { blocksToModelInput } from "../logic/block-parser";
import { Sidebar } from "@/components/Sidebar";
import { ChatInput } from "@/components/ChatInput";
import { BlockType } from "@/types/block";
import { doFetch } from "@/logic/do-fetch";

type ModelName = "gpt-3.5-turbo" | "gpt-4";

const defaultModel: ModelName = "gpt-3.5-turbo";

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

/**
 * TODO:
 * - Scroll down to bottom of chat when new message appears
 * - blocks to model input
 * - model output to block
 * - Story generation button
 * - Extra question button
 * -
 */

export const App = () => {
  useEffect(() => {
    memory.load();
  }, []);
  const [level, setLevel] = useState(1);
  const [model, setModel] = useState<ModelName>(defaultModel);
  const [blocks, setBlocks] = useState<BlockType[]>(defaultBlocks);
  const [isLoading, setLoading] = useState(false);

  const scrollChatToBottom = () =>
    setTimeout(() => {
      document.querySelector("#chat-window")?.scrollTo({
        top: 9999999999,
        behavior: "smooth",
      });
    }, 0);

  const submitQuery = async (text: string) => {
    setLoading(true);
    const userBlock: BlockType = { loading: true, text, type: "user_answer" };
    setBlocks([...blocks, userBlock]);
    scrollChatToBottom();

    // TODO Possibly use Post for json blocks and then use logic on server-side
    const correction = doFetch(`/api/user_query`, {
      level,
      conversation: blocksToModelInput(blocks),
      query: text,
      naturality: "false",
    }).catch((err) => {
      setBlocks([...blocks, { type: "system", text: String(err) }]);
    });

    const naturality = doFetch(`/api/user_query`, {
      level,
      conversation: blocksToModelInput(blocks),
      query: text,
      naturality: "true",
    }).catch((err) => {
      setBlocks([...blocks, { type: "system", text: String(err) }]);
    });

    const [correctionData, naturalityData] = await Promise.all([
      correction,
      naturality,
    ]);
    setLoading(false);

    const newBlocks: BlockType[] = [
      ...blocks,
      {
        text,
        type: "user_answer",
        completed: correctionData.text === "正确",
      },
    ];
    if (naturalityData.text !== "已经很自然") {
      newBlocks.push({
        text: naturalityData.text,
        type: "ai_natural_correction",
      });
    }
    if (correctionData.text !== "正确") {
      newBlocks.push({ text: correctionData.text, type: "ai_correction" });
    }
    setBlocks(newBlocks);
    scrollChatToBottom();
  };

  const onAddStory = async () => {
    // doFetch(`/api/new_story`, {}).then((res) => {
    //   const data = res.data;
    // });
  };

  const onAddQuestion = async () => {
    // doFetch(`/api/new_story`, {}).then((res) => {
    //   const data = res.data;
    // });
  };

  return (
    <div className="page-container">
      <Sidebar
        level={level}
        model={model}
        onModelChange={(m) => setModel(m as ModelName)}
        onLevelChange={(l) => setLevel(l)}
      />
      <div className="page-main">
        <Chat blocks={blocks} isLoading={isLoading} />
        <ChatInput
          onAddStory={onAddStory}
          onAddQuestion={onAddQuestion}
          onSubmit={submitQuery}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

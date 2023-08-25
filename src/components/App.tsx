import { useEffect, useState } from "react";
import { Chat } from "../components/Chat";
import * as memory from "../logic/memory";
import { blocksToModelInput } from "../logic/block-parser";
import { Sidebar } from "@/components/Sidebar";
import { ChatInput } from "@/components/ChatInput";
import { BlockType } from "@/types/block";
import { jsonFetch, streamFetch } from "@/logic/do-fetch";

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
    correction: "blabla",
  },
];

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

export const App = () => {
  useEffect(() => {
    memory.load();
  }, []);
  const [level, setLevel] = useState(2);
  const [model, setModel] = useState<ModelName>(defaultModel);
  const [blocks, setBlocks] = useState<BlockType[]>(defaultBlocks);
  const [isLoading, setLoading] = useState(false);

  const submitQuery = async (text: string) => {
    setLoading(true);
    const userBlock: BlockType = { loading: true, text, type: "user_answer" };
    blocks.push(userBlock);
    setBlocks(blocks);
    scrollChatToBottom();
    let naturalityCorrection = "";
    let correctionBlock: BlockType = {
      text: "",
      loading: true,
      type: "ai_answer",
    };

    // This corrects whatever the user wrote, independent of the story
    const naturalityRequest = streamFetch(
      `/api/user_query`,
      {
        level,
        conversation: blocksToModelInput(blocks),
        query: text,
        naturality: "true",
      },
      (str) => {
        naturalityCorrection += str;
        const noopAnswer = "一定很自然";
        const differsFromNoop =
          naturalityCorrection.length > noopAnswer.length ||
          naturalityCorrection !==
            noopAnswer.slice(0, naturalityCorrection.length);
        if (differsFromNoop) {
          userBlock.correction = naturalityCorrection;
          setBlocks(blocks);
        }
      }
    )
      .then(() => {
        userBlock.loading = false;
        setBlocks(blocks);
      })
      .catch((err) => {
        setBlocks([...blocks, { type: "system", text: String(err) }]);
      });

    // This reacts to the the user's query, dependent on the story
    const correctionRequest = streamFetch(
      `/api/user_query`,
      {
        level,
        conversation: blocksToModelInput(blocks),
        query: text,
        naturality: "false",
      },
      (str) => {
        correctionBlock.text += str;
        const noopAnswer = "正确";
        const differsFromNoop =
          correctionBlock.text.length > noopAnswer.length ||
          correctionBlock.text !==
            noopAnswer.slice(0, correctionBlock.text.length);
        if (differsFromNoop && !blocks.includes(correctionBlock)) {
          blocks.push(correctionBlock);
          setBlocks(blocks);
          scrollChatToBottom();
        } else if (differsFromNoop) {
          setBlocks(blocks);
        }
      }
    )
      .then(() => {
        correctionBlock.loading = false;
        setBlocks(blocks);
        // TODO If it's an answer to a user question, shouldn't mark item as completed
        if (correctionBlock.text === "正确") {
          userBlock.completed = true;
        }
      })
      .catch((err) => {
        setBlocks([...blocks, { type: "system", text: String(err) }]);
      });

    await Promise.all([naturalityRequest, correctionRequest]);
  };

  const onAddStory = async () => {
    // jsonFetch(`/api/new_story`, {}).then((res) => {
    //   const data = res.data;
    // });
  };

  const onAddQuestion = async () => {
    // jsonFetch(`/api/new_story`, {}).then((res) => {
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

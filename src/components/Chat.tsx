import { Suspense, lazy, useContext } from "react";
import { BlockType } from "@/types/block";
import { DictContext } from "@/logic/dictionary";
import dynamic from "next/dynamic";

const Block = lazy(() => import("./Block"));

const _Chat = ({
  blocks,
  isLoading,
}: {
  blocks: BlockType[];
  isLoading: boolean;
}) => {
  const dictData = useContext(DictContext);

  if (!dictData) {
    return (
      <div id="chat-window" className="chat">
        <Suspense fallback={<div>Loading...</div>}>
          <Block
            block={{
              type: "system",
              loading: true,
              text: "Loading Dictionary Data",
            }}
          />
        </Suspense>
      </div>
    );
  }

  return (
    <div id="chat-window" className="chat">
      {blocks.map((block, i) => (
        <Suspense fallback={<div>Loading...</div>} key={i}>
          <Block key={i} block={block} />
        </Suspense>
      ))}
    </div>
  );
};

export const Chat = dynamic(() => Promise.resolve(_Chat), {
  ssr: false,
});

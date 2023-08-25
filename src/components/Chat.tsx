import { useState } from "react";
import { doFetch } from "../logic/do-fetch";
import { Block } from "./Block";
import { BlockType } from "@/types/block";

export const Chat = ({
  blocks,
  isLoading,
}: {
  blocks: BlockType[];
  isLoading: boolean;
}) => {
  return (
    <div id="chat-window" className="chat">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
      {isLoading && (
        <div className="chat-block chat-block-loading">Loading...</div>
      )}
    </div>
  );
};

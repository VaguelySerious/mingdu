import { useState } from "react";
import dynamic from "next/dynamic";

const MicInput = dynamic(() => import("./MicInput"), {
  ssr: false,
});

export const ChatInput = ({
  onSubmit,
  isLoading,
}: {
  onSubmit: (str: string) => Promise<void>;
  isLoading: boolean;
}) => {
  const [text, setText] = useState("");
  return (
    <div className="chat-input">
      <input
        className="input chat-input-text"
        type="text"
        name="main-input"
        id="main-input"
        placeholder="Respond to the question or ask about the story, or any other question you have."
        disabled={isLoading}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && text.length > 0 && !isLoading) {
            // TODO notify user if text <= 0 and they hit enter
            e.preventDefault();
            onSubmit(text);
            setText("");
          }
        }}
      ></input>
      <MicInput onText={setText} />
    </div>
  );
};

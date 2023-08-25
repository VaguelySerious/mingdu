import { useState } from "react";

export const ChatInput = ({
  onSubmit,
  onAddQuestion,
  onAddStory,
  isLoading,
}: {
  onSubmit: (str: string) => Promise<void>;
  onAddQuestion: () => Promise<void>;
  onAddStory: () => Promise<void>;
  isLoading: boolean;
}) => {
  const [text, setText] = useState("");
  return (
    <div className="chat-input">
      <input
        className="input"
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
    </div>
  );
};

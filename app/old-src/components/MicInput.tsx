"use client";
import "regenerator-runtime/runtime";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { MicIcon } from "./mic";
import clsx from "clsx";
import { useEffect } from "react";

// This component uses browser APIs only available on the client, so we don't SSR

export default function MicInput({
  onText,
}: {
  onText: (text: string) => void;
}) {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      onText(transcript);
    }
  }, [transcript, onText]);

  if (!browserSupportsSpeechRecognition) {
    return <div>Browser does not support speech recognition.</div>;
  }

  const onClick = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      onText(transcript);
      resetTranscript();
    } else {
      SpeechRecognition.startListening({
        continuous: true,
        interimResults: true,
        language: "zh-CN",
      });
    }
  };

  return (
    <div
      className={clsx("chat-input-mic-wrapper", listening && "active")}
      onClick={onClick}
    >
      <div className="chat-input-mic">
        <MicIcon />
      </div>
    </div>
  );
}

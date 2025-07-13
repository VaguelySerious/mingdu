"use client";
import { Textarea as ShadcnTextarea } from "@/components/ui/textarea";
import { QueryStatusType } from "@/lib/types";
import { ArrowUp } from "lucide-react";
import { Spinner } from "../ui/spinner";

interface InputProps {
  input: string;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  queryStatus: QueryStatusType;
  stop: () => void;
}

const QUERY_STATUS_MAP: Record<QueryStatusType, string> = {
  streaming: "Streaming...",
  submitted: "Waiting...",
  ready: "Ready",
  error: "Error",
};

export const Textarea = ({
  input,
  handleInputChange,
  queryStatus,
  stop,
}: InputProps) => {
  const isLoading = queryStatus === "streaming" || queryStatus === "submitted";
  return (
    <div className="relative w-full pt-4">
      <ShadcnTextarea
        className="resize-none bg-secondary w-full rounded-2xl pr-12 pt-4 pb-16"
        value={input}
        autoFocus
        placeholder={"Say something..."}
        // @ts-expect-error err
        onChange={handleInputChange}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (input.trim() && !isLoading) {
              // @ts-expect-error err
              const form = e.target.closest("form");
              if (form) form.requestSubmit();
            }
          }
        }}
      />
      <div className="absolute p-4 bottom-2 left-2 flex flex-col gap-2">
        <div className="text-sm">{QUERY_STATUS_MAP[queryStatus]}</div>
      </div>
      {queryStatus === "streaming" || queryStatus === "submitted" ? (
        <button
          type="button"
          onClick={stop}
          className="cursor-pointer absolute right-2 bottom-2 rounded-full p-2 bg-black hover:bg-zinc-800 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-colors"
        >
          <Spinner />
        </button>
      ) : (
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="absolute right-2 bottom-2 rounded-full p-2 bg-black hover:bg-zinc-800 disabled:bg-zinc-300 disabled:dark:bg-zinc-700 dark:disabled:opacity-80 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowUp className="h-4 w-4 text-white" />
        </button>
      )}
    </div>
  );
};

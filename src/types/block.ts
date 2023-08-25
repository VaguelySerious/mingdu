export interface BlockType {
  text: string;
  id?: number;
  completed?: boolean;
  loading?: boolean;
  correction?: string;
  type:
    | "user_answer"
    | "user_question"
    | "story"
    | "task"
    | "ai_answer"
    | "system";
}

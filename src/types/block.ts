export interface BlockType {
  text: string;
  id?: number;
  completed?: boolean;
  loading?: boolean;
  type:
    | "user_answer"
    | "user_question"
    | "story"
    | "task"
    | "ai_correction"
    | "ai_natural_correction"
    | "ai_answer"
    | "system";
}

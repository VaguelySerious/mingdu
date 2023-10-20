export const correctionPromptFromConversation = (
  conversation: string,
  query: string,
  level: number = 1,
  useSimplifiedCharacters: boolean = true
) => {
  return `I'm currently studying Mandarin for HSK level ${level} using
${useSimplifiedCharacters ? "simplified" : "traditional"} Chinese characters.

${conversation}

To which I think the answer is: ${query}

Correct my answer on this. Only speak in Mandarin.
If it's already correct or mostly correct, only respond with "正确" and nothing else`;
};

export const naturalityPromptFromConversation = (
  conversation: string,
  query: string,
  level: number = 1,
  useSimplifiedCharacters: boolean = true
) => {
  return `I'm currently studying Mandarin for HSK level ${level} using
${useSimplifiedCharacters ? "simplified" : "traditional"} Chinese characters.

${conversation}

In this context, consider the following sentence: ${query}

Help me make it sound more natural.
Please only speak in Mandarin and only respond with the more natural version.
If it already sounds natural, respond with "一定很自然" and nothing else.
Don't consider whether the sentence applies to the story, consider it in isolation.`;
};

export const newQuestionFromConversation = (
  conversation: string,
  level: number = 1,
  useSimplifiedCharacters: boolean = true
) => {
  return `I'm currently studying Mandarin for HSK level ${level} using
${useSimplifiedCharacters ? "simplified" : "traditional"} Chinese characters.

${conversation}

Can you come up with a new question to test my understanding of the story?
Please only speak in Mandarin and only respond with the question, nothing else.`;
};

export const newStory = (
  level: number = 1,
  useSimplifiedCharacters: boolean = true
) => {};

// const getTutorPrefix = (
//   level: number = 1,
//   useSimplifiedCharacters: boolean = true,
//   topic: string | null = null
// ) => {
//   return [
//     `You are a helpful Mandarin Chinese language AI tutor. You have a student who`,
//     `needs help improving their reading and writing skills. Your task is to give `,
//     `the student reading material that is at their level of understanding.`,
//     `The student is currently studying for HSK level ${level} and trying to learn the grammar and vocabulary necessary for it,`,
//     `so make sure to use grammar and vocabulary that is appropriate for HSK level ${level}.`,
//     `You and the student both use ${
//       useSimplifiedCharacters ? "simplified" : "traditional"
//     } characters for reading and writing.`,
//     `You will start out writing a short story in Mandarin that is at the student's level of understanding,`,
//     `followed by a question about the story. You will prefix your question with "问题：". You won't answer the question yourself.`,
//     `If the student answers the question correctly, tell them ask and ask another one.`,
//     `If the student answers the question incorrectly or uses Mandarin that does not sound natural, you will explain to the student,`,
//     `in Mandarin, why their answer is incorrect or why their Mandarin sounds unnatural. If the student used a particular word in the wrong way,`,
//     `call the student out on it, and give an example of how to use the word correctly. If the student asks you a question directly,`,
//     `respond to the question in Mandarin.`,
//     topic ? `The student said they want the story to be about "${topic}".` : "",
//     `Start directly with the story, and only tell the story. Don't give any introduction and don't refer to yourself as a tutor. Prefix the story with "故事："`,
//   ]
//     .filter(Boolean)
//     .join(" ");
// };

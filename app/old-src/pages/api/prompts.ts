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

export const newStoryFromVocabulary = (
  level: number = 1,
  useSimplifiedCharacters: boolean = true,
  vocabulary: string[] = []
) => {
  return `I'm currently studying Mandarin for HSK level ${level} using
${useSimplifiedCharacters ? "simplified" : "traditional"} Chinese characters.

Can you come up with a short story to help me practice?
The short story should be very short, around two paragraphs long.
${
  vocabulary.length
    ? "Preferably, the story should include or be set around the following characters: " +
      vocabulary.join(",")
    : ""
}
Please only speak in Mandarin and only respond with the story, nothing else.`;
};

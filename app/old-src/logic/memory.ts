let memory: Record<string, number> = {};

export const load = () => {
  try {
    memory = JSON.parse(localStorage.getItem("memory") || "{}");
  } catch (error) {
    console.log(error);
    memory = {};
  }
};

export const save = () => {
  try {
    localStorage.setItem("memory", JSON.stringify(memory));
  } catch (error) {
    console.log(error);
  }
};

export const get = (word: string) => {
  return memory[word];
};

export const set = (word: string, level: number) => {
  memory[word] = level;
  save();
};

export const getByLevel = (level: number) => {
  return Object.keys(memory).filter((key) => {
    return memory[key] === level;
  });
};

export const getOrPromptOpenAIKey = () => {
  let OPENAI_API_KEY = "";
  try {
    OPENAI_API_KEY = localStorage.getItem("OPENAI_API_KEY") || "";
  } catch (e) {}
  if (!OPENAI_API_KEY) {
    OPENAI_API_KEY =
      window.prompt(
        "First time using the app: Enter your OpenAI API key. It will be saved in localStorage for further requests, and it won't be logged on the server. If in doubt, check source code at https://github.com/VaguelySerious/mingdu"
      ) || "";
    if (OPENAI_API_KEY) {
      try {
        localStorage.setItem("OPENAI_API_KEY", OPENAI_API_KEY);
      } catch (e) {}
    }
  }
  return OPENAI_API_KEY;
};

export const setJson = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.log(error);
  }
};

export const getJson = (key: string) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch (error) {
    console.log(error);
    return null;
  }
};

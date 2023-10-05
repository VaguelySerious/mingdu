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

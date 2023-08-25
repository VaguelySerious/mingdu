export const load = () => {
  try {
    // @ts-ignore
    JSON.parse(localStorage.getItem("memory"));
  } catch (error) {
    console.log(error);
    // @ts-ignore
    window.memory = {};
  }
};

export const save = () => {
  try {
    // @ts-ignore
    localStorage.setItem("memory", JSON.stringify(window.memory));
  } catch (error) {
    console.log(error);
  }
};

export const get = (key: string) => {
  // @ts-ignore
  return window.memory[key];
};

export const set = (key: string, value: string) => {
  // @ts-ignore
  window.memory[key] = value;
  save();
};

export const getForgottenItems = () => {
  // @ts-ignore
  return Object.keys(window.memory).filter((key) => {
    // @ts-ignore
    return window.memory[key].performance === 0;
  });
};

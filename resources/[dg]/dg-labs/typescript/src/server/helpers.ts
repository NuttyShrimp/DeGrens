export const deepCopy = <T extends Record<string, any>>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

const commandState = {
  cloak: false,
  noclip: false,
};

type CommandStateType = typeof commandState;

export const getCmdState = <T extends keyof CommandStateType>(k: T) => {
  return commandState[k];
};

export const setCmdState = <T extends keyof CommandStateType>(k: T, val: CommandStateType[T]) => {
  commandState[k] = val;
};

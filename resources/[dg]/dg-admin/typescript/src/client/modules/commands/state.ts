let state = {
  invisible: false,
};

type stateType = typeof state;

export const getCmdState = <T extends keyof stateType>(k: T) => {
  return state[k];
};

export const setCmdState = <T extends keyof stateType>(k: T, val: stateType[T]) => {
  state[k] = val;
};

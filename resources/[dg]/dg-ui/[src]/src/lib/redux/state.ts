let initialState: any = {};

const auxStates: string[] = [];
export const getAuxStates = () => auxStates;
export const addAuxState = (stateName: string): void => {
  auxStates.push(stateName);
};

export const GetInitialState = () => initialState;

export const setInitialState = () => {
  const importAll = r => {
    Object.keys(r).forEach(key => {
      const result = r[key].default;
      initialState = {
        ...initialState,
        ...(result.auxiliaryState ?? {}),
        [result.key]: result.initialState,
      };
    });
  };
  importAll(import.meta.globEager('../../main/**/store.ts'));
  return initialState;
};

import { addAuxState, GetInitialState } from './state';

const reducer: any = (state = GetInitialState(), action) => {
  switch (action.type) {
    case 'dg-ui-action':
      return action.cb(state)[action.key];
    default:
      return state[action.key];
  }
};

export const setReducers = () => {
  const initred = {};
  const importAll = r => {
    Object.keys(r).forEach(key => {
      const result = r[key].default;
      initred[result.key] = (state, action) =>
        reducer(
          {
            ...GetInitialState(),
            [result.key]: { ...GetInitialState()[result.key], ...state },
          },
          { ...action, key: result.key }
        );
      if (!result.auxiliaryState) return;
      Object.keys(result.auxiliaryState).forEach(auxKey => {
        addAuxState(auxKey);
        initred[auxKey] = (state, action) =>
          reducer(
            {
              ...GetInitialState(),
              [auxKey]: { ...GetInitialState()[auxKey], ...state },
            },
            { ...action, key: auxKey }
          );
      });
    });
  };
  importAll(import.meta.globEager('../../main/**/store.ts'));
  return initred;
};

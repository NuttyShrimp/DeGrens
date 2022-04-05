import { connect, Provider } from 'react-redux';

import { store } from './redux/store';
export { getAuxStates, GetInitialState } from './redux/state';
export { connect, Provider, store };

export type StoreObject<I = Object, A = Object> = {
  key: string;
  initialState: I;
  auxiliaryState?: A;
};

export const type = 'dg-ui-action';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const compose = (
  storeObj: StoreObject,
  { mapStateToProps: extraMap = (_o: any) => ({}), mapDispatchToProps: extraDispatch = {} } = {}
) => {
  const mapStateToProps = state => {
    return {
      ...state[storeObj.key],
      ...extraMap(state),
    };
  };
  const updateState = data => {
    if (typeof data === 'function') {
      return { cb: data, type };
    }
    const cb = state => ({
      ...state,
      [storeObj.key]: {
        ...state[storeObj.key],
        ...data,
      },
    });
    return { cb, type };
  };
  const mapDispatchToProps = {
    ...extraDispatch,
    updateState,
  };
  return {
    mapStateToProps,
    mapDispatchToProps,
  };
};

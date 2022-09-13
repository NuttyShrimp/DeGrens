import { connect, Provider, useDispatch } from 'react-redux';

import { store } from './redux/store';

export { getAuxStates, GetInitialState } from './redux/state';
export { connect, Provider, store };

export type StoreObject<I = Object, A = Partial<Record<keyof RootState, any>>> = {
  key: keyof RootState;
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

export const useUpdateState = <T extends keyof RootState>(storeName: T) => {
  const dispatch = useDispatch();
  const updateState = (data: Partial<RootState[T]> | ((state: RootState) => Partial<RootState[T]>)) => {
    const cb = (state: RootState) => ({
      ...state,
      [storeName]: {
        ...state[storeName],
        ...(typeof data === 'function' ? data(state) : data),
      },
    });
    dispatch({ cb, type });
  };
  return updateState;
};

import { connect, Provider } from 'react-redux';
import * as Sentry from '@sentry/react';
import { combineReducers, compose as baseCompose, createStore } from 'redux';

import { isDevel } from './env';
import { addAuxState } from './event-relay';

export { connect, Provider };

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

export let store: any = null;

let initialState: any = {};

export const GetInitialState = () => initialState;

const reducer: any = (state = initialState, action) => {
  switch (action.type) {
    case type:
      return action.cb(state)[action.key];
    default:
      return state[action.key];
  }
};

const setReducers = () => {
  const initred = {};
  const importAll = r => {
    Object.keys(r).forEach(key => {
      const result = r[key].default;
      initred[result.key] = (state, action) =>
        reducer(
          {
            ...initialState,
            [result.key]: { ...initialState[result.key], ...state },
          },
          { ...action, key: result.key }
        );
      if (!result.auxiliaryState) return;
      Object.keys(result.auxiliaryState).forEach(auxKey => {
        addAuxState(auxKey);
        initred[auxKey] = (state, action) =>
          reducer(
            {
              ...initialState,
              [auxKey]: { ...initialState[auxKey], ...state },
            },
            { ...action, key: auxKey }
          );
      });
    });
  };
  importAll(import.meta.globEager('../main/**/store.ts'));
  return initred;
};

const setInitialState = () => {
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
  importAll(import.meta.globEager('../main/**/store.ts'));
  return initialState;
};

const sentryReduxEnhancer = Sentry.createReduxEnhancer({
  // Optionally pass options listed below
});

const composeEnhancers = isDevel() ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?? baseCompose : baseCompose;
store = createStore(
  combineReducers({
    ...setReducers(),
  }),
  setInitialState(),
  composeEnhancers(sentryReduxEnhancer)
);

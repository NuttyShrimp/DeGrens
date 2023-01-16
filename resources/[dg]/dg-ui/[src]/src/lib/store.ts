import { configureScope } from '@sentry/react';
import { create as zCreate, StateCreator, StoreMutatorIdentifier } from 'zustand';

const storeResetFns = new Set<() => void>();

export const resetAllStores = () => {
  storeResetFns.forEach(fn => fn());
};

// region Sentry middleware
const trackedStores: string[] = [];
type SentryMiddleware = <
  T extends object,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<T, Mps, Mcs>,
  name: string
) => StateCreator<T, Mps, Mcs>;

type SentryMiddlewareImpl = <T extends object>(f: StateCreator<T, [], []>, name: string) => StateCreator<T, [], []>;

const sentryMiddlewareImpl: SentryMiddlewareImpl = (f, storeName) => (set, get, store) => {
  if (trackedStores.includes(storeName)) {
    throw new Error(`${storeName} is already used as store identifier`);
  }
  return f(
    (...args) => {
      set(...args);
      const newState = get();
      configureScope(scope => {
        if (newState) {
          scope.setContext('state', {
            state: {
              type: `zustand - ${storeName}`,
              value: newState,
            },
          });
        } else {
          scope.setContext('state', null);
        }
      });
    },
    get,
    store
  );
};

const sentryMiddleware = sentryMiddlewareImpl as unknown as SentryMiddleware;
// endregion

// when creating a store, we get its initial state, create a reset function and add it in the set
export const create =
  <S extends object>(storeIdentifier: string) =>
  (createState: StateCreator<S>) => {
    const store = zCreate<S>(sentryMiddleware<S>(createState, storeIdentifier));
    const initialState = store.getState();
    storeResetFns.add(() => store.setState(initialState, true));
    return store;
  };

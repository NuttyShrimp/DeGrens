import * as Sentry from '@sentry/react';
import { combineReducers, compose, createStore } from 'redux';

import { isDevel } from '../env';

import { setReducers } from './reducers';
import { setInitialState } from './state';

const sentryReduxEnhancer = Sentry.createReduxEnhancer({
  // Optionally pass options listed below
});

const composeEnhancers = isDevel() ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose : compose;

export const store = createStore(
  combineReducers({
    ...setReducers(),
  }),
  setInitialState(),
  composeEnhancers(sentryReduxEnhancer)
);

import { GetInitialState, store, type } from './redux';

const events: { [appName: string]: { [eventName: string]: (data: any) => void } } = {
  main: {
    restart: () => {
      store.dispatch({
        type,
        cb: state => ({
          ...state,
          main: {
            mounted: false,
            ...state.main,
          },
        }),
      });
      setTimeout(() => {
        store.dispatch({
          type,
          cb: () => GetInitialState(),
        });
      }, 2000);
    },
  },
};
const auxStates: string[] = [];

export const registerRelayEvent = (app: string, eventName: string, handler: (data: any) => void): void => {
  events[app] = events[app] || {};
  events[app][eventName] = handler;
};

export const addAuxState = (stateName: string): void => {
  auxStates.push(stateName);
};

export const handleIncomingEvent = (e: MessageEvent) => {
  if (!e.data.app || !e.data.data) {
    return;
  }
  if (auxStates.includes(e.data.app)) {
    // Dispatch setter for state
    store.dispatch({
      type,
      cb: state => ({
        ...state,
        [e.data.app]: {
          ...state[e.data.app],
          ...e.data.data,
        },
      }),
    });
    return;
  }
  if (events[e.data.app] && events[e.data.app][e.data.data.event]) {
    events[e.data.app][e.data.data.event](e.data.data);
    return;
  }
};

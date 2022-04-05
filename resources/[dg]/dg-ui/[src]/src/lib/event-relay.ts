import { events } from './events';
import { getAuxStates, store } from './redux';

export const registerRelayEvent = (app: string, eventName: string, handler: (data: any) => void): void => {
  events[app] = events[app] || {};
  events[app][eventName] = handler;
};

export const handleIncomingEvent = (e: MessageEvent) => {
  if (!e.data.app || !e.data.data) {
    return;
  }
  if (getAuxStates().includes(e.data.app)) {
    // Dispatch setter for state
    store.dispatch({
      type: 'dg-ui-action',
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

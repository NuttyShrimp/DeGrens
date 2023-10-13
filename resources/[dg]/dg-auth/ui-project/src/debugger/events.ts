import { closeSocket, openSocket, sendEvents } from './socket';

export const onEvent = async (evt: MessageEvent) => {
  if (!evt.data.action || !evt.data.action.startsWith('debugger/')) return;
  switch (evt.data.action.replace('debugger/', '')) {
    case 'open': {
      if (!evt.data.token) {
        throw new Error('Missing authentication token for debugger socket');
      }
      openSocket(evt.data.token);
      break;
    }
    case 'events': {
      if (!evt.data.events || evt.data.events.length < 1) {
        return;
      }
      sendEvents(evt.data.events);
      break;
    }
    case 'close': {
      closeSocket();
      break;
    }
  }
};

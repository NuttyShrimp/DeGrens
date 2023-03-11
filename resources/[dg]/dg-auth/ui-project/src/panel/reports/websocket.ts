import { nuiAction } from '../../events';

import { getPanelInfo } from './infoStore';
import { closeWS, getWS, hasOpenWS, removeWS, setWS } from './socketStorage';

export const requestMiddleware = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response | undefined> => {
  try {
    const resp = await fetch(input, init);
    if (resp.status === 401) {
      nuiAction('panel/reconnect');
      console.log('entering panel reauth wait state');
      await new Promise(r => setTimeout(r, 1000));
      console.log('reauthenticating panel token');
      return requestMiddleware(input, init);
    }
    return resp;
  } catch (e) {
    console.error(e);
    return undefined;
  }
};

const handleWSMessage = (id: number) => (evt: MessageEvent) => {
  try {
    const message = JSON.parse(evt.data);
    // console.log('received a WS message', message);
    switch (message.type) {
      case 'addMessages': {
        nuiAction('panel/reports/addMessages', {
          msgs: message.data,
        });
        break;
      }
      case 'addMessage': {
        nuiAction('panel/reports/addMessages', {
          msgs: [message.data],
        });
        break;
      }
      case 'error': {
        console.error(message.data);
        break;
      }
      case 'toggleState': {
        nuiAction('panel/report/state', {
          id,
          toggle: message.data,
        });
        break;
      }
      default: {
        break;
      }
    }
  } catch (e) {
    console.error(e);
  }
};

export const openReportWebsocket = (id: number) => {
  if (hasOpenWS(id)) return;

  const WSUrl = new URL(getPanelInfo().endpoint);

  let wsResolver: Function;
  const wsPromise = new Promise(res => (wsResolver = res));

  const ws = new WebSocket(`ws${WSUrl.protocol === 'https:' ? 's' : ''}://${WSUrl.host}/api/staff/reports/join/${id}`);
  if (ws === null) {
    console.error('Failed to open websocket');
    return;
  }
  ws.addEventListener('open', () => {
    console.log(`Opening WS ${id}`);
    nuiAction('panel/reports/openedWS');
    wsResolver();
  });

  ws.addEventListener('close', () => {
    console.log('The WS closed');
    nuiAction('panel/reports/closedWS');
    removeWS(ws);
  });

  ws.addEventListener('message', handleWSMessage(id));

  setWS(id, ws);
  return wsPromise;
};

export const closeReportWebsocket = (id: number) => {
  if (!hasOpenWS(id)) return;
  console.log(`Closing ${id} websocket`);
  const ws = getWS(id);
  closeWS(id);
  ws.close(1000, 'closed conversation');
};

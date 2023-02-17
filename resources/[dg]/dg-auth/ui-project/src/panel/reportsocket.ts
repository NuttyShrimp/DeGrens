import { nuiAction } from '../events';

const watchedWS: Record<number, WebSocket> = {};
let panelInfo: Panel.Auth.Info = {
  endpoint: '',
  token: '',
  steamId: '',
};
let loggingIn = false;

const requestMiddleware = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response | undefined> => {
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

const loginPlayer = async () => {
  if (loggingIn) return;
  loggingIn = true;
  await requestMiddleware(`${panelInfo.endpoint}/api/auth/login?type=cfxtoken`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${panelInfo.token}`,
    },
  });
  loggingIn = false;
};

export const setInfo = (info: Panel.Auth.Info) => {
  panelInfo = info;
  loginPlayer();
};

const sendNonWSMessage = async (reportId: number, message: Object) => {
  await requestMiddleware(`${panelInfo.endpoint}/api/staff/reports/message/add`, {
    method: 'POST',
    body: JSON.stringify({
      reportId: reportId,
      message,
    }),
  });
};

export const fetchReports = async (tags: string[] = []) => {
  try {
    const urlParams = new URLSearchParams({
      offset: '0',
      filter: '',
      open: 'true',
      closed: 'false',
    });
    tags.forEach(t => {
      urlParams.append('tags', t);
    });
    const rawResp = await requestMiddleware(`${panelInfo.endpoint}/api/staff/reports/all?${urlParams.toString()}`, {
      method: 'GET',
    });
    if (!rawResp || rawResp.status >= 400) {
      return;
    }
    const resp = await rawResp.json();
    // TODO: support pagination
    nuiAction('panel/reports/set', resp?.reports ?? []);
  } catch (e) {
    console.error(e);
  }
};

export const createReport = async (info: Panel.NewReport): Promise<undefined | number> => {
  try {
    const rawResp = await requestMiddleware(`${panelInfo.endpoint}/api/staff/reports/new`, {
      method: 'POST',
      body: JSON.stringify({
        title: info.title,
        members: [panelInfo.steamId],
        tags: [],
      }),
    });
    if (!rawResp || rawResp.status >= 400) {
      return;
    }
    const resp = await rawResp.json();
    if (!resp.token || Number.isNaN(Number(resp.token))) {
      console.error('No report id received');
      return;
    }
    const reportId = Number(resp.token);
    await sendNonWSMessage(reportId, info.message);
    return reportId;
  } catch (e) {
    console.error(e);
    return;
  }
};

export const sendNewMessage = async (reportId: number, message: Object) => {
  if (!watchedWS[reportId]) {
    await openReportWebsocket(reportId);
  }
  watchedWS[reportId].send(
    JSON.stringify({
      type: 'addMessage',
      data: message,
    })
  );
};

export const openReportWebsocket = (id: number) => {
  if (watchedWS[id]) return;

  const WSUrl = new URL(panelInfo.endpoint);

  let wsResolver: Function;
  const wsPromise = new Promise(res => (wsResolver = res));

  const ws = new WebSocket(`ws${WSUrl.protocol === 'https:' ? 's' : ''}://${WSUrl.host}/api/staff/reports/join/${id}`);
  if (ws === null) {
    console.error('Failed to open websocket');
    return;
  }
  ws.addEventListener('open', () => {
    nuiAction('panel/reports/openedWS');
    wsResolver();
  });

  ws.addEventListener('close', () => {
    console.log('The WS closed');
    nuiAction('panel/reports/closedWS');
    delete watchedWS[id];
  });

  ws.addEventListener('message', evt => {
    try {
      const message = JSON.parse(evt.data);
      console.log('received a WS message', message);
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
        default: {
          break;
        }
      }
    } catch (e) {
      console.error(e);
    }
  });

  watchedWS[id] = ws;
  return wsPromise;
};

export const closeReportWebsocket = (id: number) => {
  if (!watchedWS[id]) return;
  console.log(`Closing ${id} websocket`);
  watchedWS[id].close();
};

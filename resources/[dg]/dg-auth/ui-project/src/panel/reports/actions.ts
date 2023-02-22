import { nuiAction } from '../../events';

import { getPanelInfo, isLoggingIn, setLoggingIn } from './infoStore';
import { getWS, hasOpenWS } from './socketStorage';
import { openReportWebsocket, requestMiddleware } from './websocket';

export const loginPlayer = async () => {
  if (isLoggingIn()) return;
  const panelInfo = getPanelInfo();
  setLoggingIn(true);
  await requestMiddleware(`${panelInfo.endpoint}/api/auth/login?type=cfxtoken`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${panelInfo.token}`,
    },
  });
  setLoggingIn(false);
};

const sendNonWSMessage = async (reportId: number, message: Object) => {
  await requestMiddleware(`${getPanelInfo().endpoint}/api/staff/reports/message/add`, {
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
    const rawResp = await requestMiddleware(
      `${getPanelInfo().endpoint}/api/staff/reports/all?${urlParams.toString()}`,
      {
        method: 'GET',
      }
    );
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
    const panelInfo = getPanelInfo();
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
  if (!hasOpenWS(reportId)) {
    await openReportWebsocket(reportId);
  }
  getWS(reportId).send(
    JSON.stringify({
      type: 'addMessage',
      data: message,
    })
  );
};

export const toggleReportState = async (reportId: number, toggle: boolean) => {
  if (!hasOpenWS(reportId)) {
    await openReportWebsocket(reportId);
  }
  getWS(reportId).send(
    JSON.stringify({
      type: 'toggleReportState',
      data: toggle,
    })
  );
};
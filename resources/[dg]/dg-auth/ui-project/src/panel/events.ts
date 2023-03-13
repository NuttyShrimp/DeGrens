import { nuiAction } from '../events';

import { createReport, fetchReports, sendNewMessage, toggleReportState } from './reports/actions';
import { closeReportWebsocket, openReportWebsocket } from './reports/websocket';

export const onEvent = async (evt: MessageEvent) => {
  let trackData: any;
  if (!evt.data.action || !evt.data.action.startsWith('panel/')) return;
  switch (evt.data.action.replace('panel/', '')) {
    case 'reports/fetch': {
      await fetchReports();
      break;
    }
    case 'reports/create': {
      trackData = await createReport(evt.data.data);
      break;
    }
    case 'reports/sendMsg': {
      sendNewMessage(evt.data.reportId, evt.data.msg);
      break;
    }
    case 'reports/setState': {
      toggleReportState(evt.data.reportId, evt.data.state);
      break;
    }
    case 'reports/openSocket': {
      openReportWebsocket(evt.data.reportId);
      break;
    }
    case 'reports/closeSocket': {
      closeReportWebsocket(evt.data.reportId);
      break;
    }
  }
  if (evt.data.trackId) {
    nuiAction('panel/finishAction', { trackId: evt.data.trackId, data: trackData });
  }
};

import { Events, UI } from '@dgx/client';
import { RegisterUICallback } from 'helpers/ui';
import { generateTrackId, registerTrackId, resolveId } from './service.panel';

Events.onNet('auth:panel:init', (info: any) => {
  SendNUIMessage({
    action: 'init-panel',
    data: info,
  });
});

Events.onNet('auth:panel:openReports', async () => {
  UI.openApplication('reports');
  SendNUIMessage({
    action: 'panel/reports/fetch',
  });
});

RegisterUICallback('panel/finishAction', (data, cb) => {
  if (!data.trackId) return;
  resolveId(data.trackId, data.data);
  cb({
    data: {},
    meta: {
      ok: true,
      message: 'done',
    },
  });
});

RegisterUICallback('panel/reconnect', (_, cb) => {
  Events.emitNet('auth:panel:reconnect');
  cb({
    data: {},
    meta: { ok: true, message: 'done' },
  });
});

RegisterUICallback('panel/reports/set', (data, cb) => {
  UI.SendAppEvent('reports', {
    action: 'setReports',
    data,
  });
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

RegisterUICallback('panel/reports/openedWS', (_, cb) => {
  UI.SendAppEvent('reports', {
    action: 'setWSConnected',
    connected: true,
  });
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

RegisterUICallback('panel/reports/closedWS', (_, cb) => {
  UI.SendAppEvent('reports', {
    action: 'setWSConnected',
    connected: false,
  });
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

RegisterUICallback('panel/reports/addMessages', (data: { msgs: Panel.Message[] }, cb) => {
  UI.SendAppEvent('reports', {
    action: 'addMessages',
    data: data.msgs ?? [],
  });
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('reports/createReport', async (data: { info: Panel.NewReport }, cb) => {
  const createTrackId = generateTrackId();
  SendNUIMessage({
    action: 'panel/reports/create',
    trackId: createTrackId,
    data: data.info,
  });
  const reportId = await registerTrackId(createTrackId);
  const fetchTrackId = generateTrackId();
  SendNUIMessage({
    action: 'panel/reports/fetch',
    trackId: fetchTrackId,
  });
  await registerTrackId(fetchTrackId);
  cb({ data: { reportId }, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('reports/join', async (data: { id: number }, cb) => {
  SendNUIMessage({
    action: 'panel/reports/openSocket',
    reportId: data.id,
  });
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('reports/closeSocket', async (data: { id: number }, cb) => {
  SendNUIMessage({
    action: 'panel/reports/closeSocket',
    reportId: data.id,
  });
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('reports/sendMessage', async (data: { id: number; msg: Object }, cb) => {
  const sendTrackId = generateTrackId();
  SendNUIMessage({
    action: 'panel/reports/sendMsg',
    reportId: data.id,
    msg: data.msg,
    trackId: sendTrackId,
  });
  await registerTrackId(sendTrackId);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.onUIReload(() => {
  Events.emitNet('auth:panel:reconnect');
});

import { Core, Events, RPC, UI } from '@dgx/client';
import { reloadUI } from 'services/race';

UI.RegisterUICallback('phone/racing/tracks', async (_, cb) => {
  const tracks = await RPC.execute('racing:races:tracks');
  cb({ data: tracks, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/racing/pending', async (_, cb) => {
  const races = await RPC.execute('racing:races:available');
  cb({ data: races, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/racing/track/preview', async (data: { trackId: number }, cb) => {
  Events.emitNet('racing:track:preview', data.trackId);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/racing/track/create', async (data: { name: string; type: string }, cb) => {
  Events.emitNet('racing:track:create', data.name, data.type);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/racing/track/edit', async (data: { trackId: number }, cb) => {
  Events.emitNet('racing:track:edit', data.trackId);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/racing/track/delete', async (data: { trackId: number }, cb) => {
  Events.emitNet('racing:track:delete', data.trackId);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback(
  'phone/racing/start',
  async (
    data: { trackId: number; startTime: string; leaderboard: boolean; classRestriction?: string; laps?: number },
    cb
  ) => {
    Events.emitNet(
      'racing:race:schedule',
      data.trackId,
      data.startTime,
      data.leaderboard,
      data.classRestriction,
      data.laps
    );
    cb({ data: {}, meta: { ok: true, message: 'done' } });
  }
);

UI.RegisterUICallback('phone/racing/race/join', async (data: { raceId: number }, cb) => {
  Events.emitNet('racing:race:join', data.raceId);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/racing/race/start', async (data: { raceId: number }, cb) => {
  Events.emitNet('racing:race:start', data.raceId);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/racing/race/cancel', async (data: { raceId: number }, cb) => {
  Events.emitNet('racing:race:cancel', data.raceId);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/racing/race/leave', async (data: { raceId: number }, cb) => {
  Events.emitNet('racing:race:leave', data.raceId);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/racing/getAlias', (_, cb) => {
  const charModule = Core.getModule('characters');
  cb({ data: charModule.getMetadata()?.racingAlias, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/racing/settings', async (data: { alias: string }, cb) => {
  Events.emitNet('racing:settings:changeAlias', data.alias);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/racing/getLeaderboard', async (data: { trackId: number }, cb) => {
  const entries = await RPC.execute('racing:track:getLeaderboard', data.trackId);
  cb({ data: entries, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/racing/kick', async (data: { raceId: number; cid: number }, cb) => {
  Events.emitNet('racing:race:kick', data.raceId, data.cid);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.onUIReload(() => {
  UI.SendAppEvent('racing', {
    action: 'resetTimer',
  });
  reloadUI();
});

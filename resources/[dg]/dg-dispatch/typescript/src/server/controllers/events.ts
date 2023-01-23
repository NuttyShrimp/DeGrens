import { Auth, Config, Events, Jobs, Notifications, RPC, Util } from '@dgx/server';
import { cleanPlayer, syncBlips, togglePlayer, updateSprite } from 'services/blips';
import { getCams, loadCams } from 'services/cams';
import { getCall, getCalls } from 'services/store';

setImmediate(async () => {
  await Config.awaitConfigLoad();
  const config = Config.getConfigValue('dispatch.cams');
  loadCams(config);
});

on('jobs:server:signin:update', (src: number, job: string | null) => {
  syncBlips();
  if (job !== 'police') {
    cleanPlayer(src);
    return;
  }
  // seed 20 first stored dispatch calls
  if (job !== null) {
    Events.emitNet('dg-dispatch:addCalls', src, getCalls(20), true);
  }
});

on('dg-config:moduleLoaded', (module: string, { cams }: { cams: Dispatch.Cams.Cam[] }) => {
  if (module !== 'dispatch') return;
  loadCams(cams);
});

Events.onNet('dg-dispatch:loadMore', (src, offset: number) => {
  const calls = getCalls(offset);
  Events.emitNet('dg-dispatch:addCalls', src, calls);
});

Events.onNet('dg-dispatch:updateBlipSprite', (src, sprite: number) => {
  updateSprite(src, sprite);
});

Events.onNet('dispatch:server:setMarker', (src, id: string) => {
  const call = getCall(id);
  if (!call || !call.coords) return;
  Util.setWaypoint(src, call.coords);
  Notifications.add(src, 'Locatie aangeduid op GPS');
});

Events.onNet('dispatch:toggleDispatchBlip', (src, dispatchEnabled: boolean) => {
  togglePlayer(src, dispatchEnabled);
});

Auth.onAuth(plyId => {
  Events.emitNet('dispatch:cams:set', plyId, getCams());
});

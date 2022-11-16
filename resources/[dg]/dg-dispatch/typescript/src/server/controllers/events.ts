import { Events, RPC } from '@dgx/server';
import { cleanPlayer, syncBlips, togglePlayer, updateSprite } from 'services/blips';
import { getCams, loadCams } from 'services/cams';
import { getCall, getCalls } from 'services/store';

setImmediate(() => {
  loadCams();
});

on('jobs:server:signin:update', (src: number, job: string) => {
  syncBlips();
  if (job !== 'police') {
    cleanPlayer(src);
    return;
  }
  // seed 20 first stored dispatch calls
  Events.emitNet('dg-dispatch:addCalls', src, getCalls(20), true);
});

on('dg-config:moduleLoaded', (module: string) => {
  if (module !== 'dispatch') return;
  loadCams();
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
  Events.emitNet('dispatch:setCallMarker', src, call.coords);
});

Events.onNet('dispatch:setDispatchBlip', (src, dispatchEnabled: boolean) => {
  togglePlayer(src, dispatchEnabled);
});

RPC.register('dispatch:cams:request', () => {
  return getCams();
});

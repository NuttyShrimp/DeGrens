import { Auth, Config, Events, Notifications, Util, Jobs, Inventory, Core } from '@dgx/server';
import { cleanPlayer, syncBlips, togglePlayer, updateSprite } from 'services/blips';
import { getCams, loadCams } from 'services/cams';
import { getCall, getCalls } from 'services/store';

setImmediate(async () => {
  await Config.awaitConfigLoad();
  const config = Config.getConfigValue('dispatch.cams');
  loadCams(config);
});

Jobs.onJobUpdate(async (plyId, job) => {
  syncBlips();

  if (job !== 'police') {
    cleanPlayer(plyId);
  }

  // seed 20 first stored dispatch calls
  if (job === 'police' || job === ' ambulance') {
    Events.emitNet('dg-dispatch:addCalls', plyId, getCalls(20, job), true);
  }

  if (job === 'police') {
    const hasBtn = await Inventory.doesPlayerHaveItems(plyId, 'emergency_button');
    togglePlayer(plyId, hasBtn);
  }
});

on('dg-config:moduleLoaded', (module: string, { cams }: { cams: Dispatch.Cams.Cam[] }) => {
  if (module !== 'dispatch') return;
  loadCams(cams);
});

Inventory.onInventoryUpdate('player', (cid, action, itemState) => {
  if (itemState.name !== 'emergency_button') return;

  const charModule = Core.getModule('characters');
  const plyId = charModule.getServerIdFromCitizenId(+cid);
  if (!plyId) return;

  togglePlayer(plyId, action === 'remove');
});

Events.onNet('dg-dispatch:loadMore', (src, offset: number) => {
  const plyJob = Jobs.getCurrentJob(src);
  if (!plyJob) return;
  const calls = getCalls(offset, plyJob);
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

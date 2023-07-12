import { Auth, Config, Events, Notifications, Util, Jobs, Inventory } from '@dgx/server';
import { doesJobHaveDispatch } from 'helpers';
import { charModule } from 'helpers/core';
import { setPlayerAsDisabled, syncBlips, updateSprite } from 'services/blips';
import { getCams, loadCams } from 'services/cams';
import { hasPlayerToggledDispatch } from 'services/dispatch';
import { getCall, getCalls } from 'services/store';

setImmediate(async () => {
  await Config.awaitConfigLoad();
  const config = Config.getConfigValue('dispatch.cams');
  loadCams(config);
});

Jobs.onJobUpdate(async (plyId, job) => {
  if (doesJobHaveDispatch(job)) {
    // seed 20 first stored dispatch calls
    Events.emitNet('dg-dispatch:addCalls', plyId, getCalls(20, job!), true);
  } else if (!hasPlayerToggledDispatch(plyId)) {
    setPlayerAsDisabled(plyId, false, true);
  }

  if (job === 'police' && !hasPlayerToggledDispatch(plyId)) {
    const hasBtn = await Inventory.doesPlayerHaveItems(plyId, 'emergency_button');
    setPlayerAsDisabled(plyId, !hasBtn, true);
  }

  syncBlips();
});

on('dg-config:moduleLoaded', (module: string, { cams }: { cams: Dispatch.Cams.Cam[] }) => {
  if (module !== 'dispatch') return;
  loadCams(cams);
});

Inventory.onInventoryUpdate(
  'player',
  async (cid, action) => {
    const plyId = charModule.getServerIdFromCitizenId(+cid);
    if (!plyId) return;
    if (hasPlayerToggledDispatch(plyId)) return; // dont override manual toggle

    // when action is add, player will always have the item, when action is remove, ply might have another
    let hasBtn = true;
    if (action === 'remove') {
      hasBtn = await Inventory.doesInventoryHaveItems('player', cid, 'emergency_button');
    }

    setPlayerAsDisabled(plyId, !hasBtn);
  },
  'emergency_button'
);

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

Auth.onAuth(plyId => {
  Events.emitNet('dispatch:cams:set', plyId, getCams());
});

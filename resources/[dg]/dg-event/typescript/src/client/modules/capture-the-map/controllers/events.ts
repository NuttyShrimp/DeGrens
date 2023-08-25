import { BaseEvents, Events, PolyZone, UI } from '@dgx/client';

import { createBlips, removeBlips, updateBlipColors } from '../services/blips';
import { addGuards, startGuardCaptureCheck } from '../services/guards';
import { initRestock } from '../services/restock';
import { initZones, updateOwner } from '../services/zones';

Events.onNet('event:ctm:init', (zoneOwners: Record<string, string>) => {
  initZones();
  createBlips();
  initRestock();
  startGuardCaptureCheck();
  Object.entries(zoneOwners).forEach(([zoneName, owner]) => {
    updateOwner(zoneName, owner);
    updateBlipColors(zoneName);
  });
  UI.SendAppEvent('phone', {
    action: 'showApp',
    appName: 'monuments',
    data: {},
  });
});

Events.onNet('event:ctm:zone:ownerShip', (zoneName: string, newOwner: string) => {
  updateOwner(zoneName, newOwner);
  updateBlipColors(zoneName);
});

Events.onNet('events:ctm:guards:sync', (guards: number[]) => {
  addGuards(guards);
});

BaseEvents.onResourceStop(() => {
  removeBlips();
  PolyZone.removeZone('ctm_capture_zone');
});

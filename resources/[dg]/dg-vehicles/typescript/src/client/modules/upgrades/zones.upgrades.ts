import { Events, PolyZone, RPC } from '@dgx/client';

Events.onNet(
  'vehicles:itemupgrades:loadZone',
  (zone: { center: Vec3; length: number; width: number; heading: number }) => {
    PolyZone.addBoxZone(
      'item_upgrades_zone',
      zone.center,
      zone.width,
      zone.length,
      { heading: zone.heading, minZ: zone.center.z - 2, maxZ: zone.center.z + 3, data: {} },
      true
    );
    console.log('[Upgrades] Zones loaded');
  }
);

let isInItemZone = false;
export const getIsInItemZone = () => isInItemZone;

PolyZone.onEnter('item_upgrades_zone', () => {
  isInItemZone = true;
});
PolyZone.onLeave('item_upgrades_zone', () => {
  isInItemZone = false;
});

RPC.register('vehicles:itemupgrades:isInZone', getIsInItemZone);

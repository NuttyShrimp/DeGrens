import { PolyZone } from '@dgx/client';

let inNoDropZone = false;

export const buildNoDropZones = (zones: Zones.Zone[]) => {
  for (let i = 0; i < zones.length; i++) {
    PolyZone.buildAnyZone('inventory_nodrop', zones[i], {
      id: i,
    });
  }
};

PolyZone.onEnter('inventory_nodrop', () => (inNoDropZone = true));
PolyZone.onLeave('inventory_nodrop', () => (inNoDropZone = false));

export const isInNoDropZone = () => inNoDropZone;

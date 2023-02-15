import { PolyZone } from '@dgx/client';

let inFarmingZone = false;

export const buildFarmingZones = (farmingZones: Farming.Config['farmingZones']) => {
  for (const idx in farmingZones) {
    const farmingZone = farmingZones[idx];
    PolyZone.addPolyZone('farming_zone', farmingZone.vectors, {
      data: {
        id: idx,
      },
      minZ: farmingZone.minZ,
      maxZ: farmingZone.maxZ,
    });
  }
};

PolyZone.onEnter('farming_zone', () => {
  inFarmingZone = true;
});

PolyZone.onLeave('farming_zone', () => {
  inFarmingZone = false;
});

export const isInFarmingZone = () => inFarmingZone;

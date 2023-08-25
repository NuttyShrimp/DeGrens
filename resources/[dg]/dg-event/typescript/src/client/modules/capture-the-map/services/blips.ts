import { blip_colors } from '@shared/data/blips';
import { ZONE_INFO } from '@shared/data/zones';

import { ownerForZone } from './zones';

const zoneToBlips: Map<string, number[]> = new Map();

export const createBlips = () => {
  ZONE_INFO.forEach(zone => {
    const blips: number[] = [];
    zone.blipLocations.forEach(blipLocation => {
      const blip = AddBlipForArea(
        blipLocation.coords.x,
        blipLocation.coords.y,
        blipLocation.coords.z,
        blipLocation.width,
        blipLocation.height
      );
      SetBlipAlpha(blip, 140);
      SetBlipRotation(blip, 0);
      SetBlipDisplay(blip, 3);
      SetBlipAsShortRange(blip, true);
      BeginTextCommandSetBlipName('STRING');
      AddTextComponentSubstringPlayerName(ownerForZone(zone.name));
      EndTextCommandSetBlipName(blip);
      blips.push(blip);
    });
    zoneToBlips.set(zone.name, blips);
    updateBlipColors(zone.name);
  });
};

export const updateBlipColors = (zoneName: string) => {
  const owner = ownerForZone(zoneName);
  const blips = zoneToBlips.get(zoneName);
  const zoneColor = blip_colors[owner];
  if (!blips) return;
  blips.forEach(blip => {
    SetBlipColour(blip, zoneColor);
    BeginTextCommandSetBlipName('STRING');
    AddTextComponentSubstringPlayerName(ownerForZone(zoneName));
    EndTextCommandSetBlipName(blip);
  });
};

export const removeBlips = () => {
  zoneToBlips.forEach(blips => {
    blips.forEach(blip => {
      RemoveBlip(blip);
    });
  });
};

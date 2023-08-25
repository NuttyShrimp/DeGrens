import { PolyZone } from '@dgx/client';
import { ZONE_INFO } from '@shared/data/zones';

const zoneToOwner: Map<string, string> = new Map();

export const initZones = () => {
  for (const zone of ZONE_INFO) {
    zoneToOwner.set(zone.name, 'The People');
    PolyZone.addCircleZone('ctm_capture_zone', zone.origin, zone.radius, {
      data: {
        id: zone.name,
      },
      useZ: true,
      routingBucket: 0,
    });
  }
};

export const updateOwner = (zoneName: string, newOwner: string) => {
  if (!zoneToOwner.has(zoneName)) return;
  zoneToOwner.set(zoneName, newOwner);
};

export const ownerForZone = (zoneName: string) => {
  return zoneToOwner.get(zoneName) ?? 'The People';
};

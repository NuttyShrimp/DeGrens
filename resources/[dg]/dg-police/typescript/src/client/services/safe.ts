import { Inventory, Peek, PolyTarget } from '@dgx/client';

export const buildSafeZones = (zones: Vec3[]) => {
  zones.forEach((zone, i) => {
    PolyTarget.addCircleZone('police_safe', zone, 4, { useZ: true, data: { id: i } });
  });
};

Peek.addZoneEntry('police_safe', {
  options: [
    {
      label: 'Open Kluis',
      icon: 'fas fa-person-rifle',
      job: 'police',
      action: () => {
        Inventory.openShop('police_safe');
      },
    },
  ],
});

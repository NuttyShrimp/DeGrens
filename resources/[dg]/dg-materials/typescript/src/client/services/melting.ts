import { Events, Peek, PolyTarget, UI } from '@dgx/client';

Peek.addZoneEntry('materials_melting', {
  options: [
    {
      label: 'Smelten',
      icon: 'fas fa-fire',
      action: () => {
        Events.emitNet('materials:melting:showMenu');
      },
    },
    {
      label: 'Neem',
      icon: 'fas fa-hand',
      action: () => {
        Events.emitNet('materials:melting:take');
      },
    },
  ],
  distance: 4.0,
});

export const buildMeltingZone = (zone: Materials.Melting.Config['zone']) => {
  PolyTarget.addBoxZone('materials_melting', zone.center, zone.width, zone.length, {
    heading: zone.heading,
    minZ: zone.minZ,
    maxZ: zone.maxZ,
    data: {},
  });
};

UI.RegisterUICallback('materials/melting/select', (data: { recipeId: number }, cb) => {
  Events.emitNet('materials:melting:melt', data.recipeId);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

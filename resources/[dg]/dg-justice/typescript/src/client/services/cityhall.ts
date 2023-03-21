import { BlipManager, Events, Keys, PolyZone, UI } from '@dgx/client';

const ZONES = [
  {
    coords: { x: -551.25, y: -201.76, z: 38.23 },
    width: 1.1,
    length: 2.25,
    heading: 344,
  },
  {
    coords: { x: -544.03, y: -197.52, z: 38.23 },
    width: 2.25,
    length: 1.1,
    heading: 346,
  },
];

let inCityHallZone = false;

export const buildCityHallZones = () => {
  for (let i = 0; i < ZONES.length; i++) {
    const zone = ZONES[i];
    PolyZone.addBoxZone('cityhall', zone.coords, zone.width, zone.length, {
      data: { id: i },
      heading: zone.heading,
      minZ: zone.coords.z - 2,
      maxZ: zone.coords.z + 2,
    });
  }

  BlipManager.addBlip({
    category: 'justice',
    id: 'cityhall',
    sprite: 439,
    color: 2,
    coords: ZONES[0].coords,
  });
};

PolyZone.onEnter('cityhall', () => {
  UI.showInteraction(`${Keys.getBindedKey('+GeneralUse')} - Stad huis`);
  inCityHallZone = true;
});

PolyZone.onLeave('cityhall', () => {
  UI.hideInteraction();
  inCityHallZone = false;
});

Keys.onPress('GeneralUse', () => {
  if (!inCityHallZone) return;
  Events.emitNet('justice:cityhall:openMenu');
});

UI.RegisterUICallback('justice/cityhall/buyId', (data, cb) => {
  Events.emitNet('justice:cityhall:buyId', data.type);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

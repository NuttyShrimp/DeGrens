import { Events, Keys, PolyZone, UI } from '@dgx/client';

let inCityHallZone = false;

PolyZone.addBoxZone('cityhall', { x: -551.25, y: -201.76, z: 38.23 }, 0.75, 2.25, {
  data: { id: 1 },
  heading: 344,
  minZ: 37.03,
  maxZ: 39.43,
});

PolyZone.addBoxZone('cityhall', { x: -544.03, y: -197.52, z: 38.23 }, 2.15, 0.8, {
  data: { id: 2 },
  heading: 346,
  minZ: 37.03,
  maxZ: 39.43,
});

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

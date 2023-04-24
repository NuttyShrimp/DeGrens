import { BlipManager, Keys, PolyZone, UI } from '@dgx/client';
import { getCurrentVehicle, isDriver } from '@helpers/vehicle';

const carwashZones: {
  center: Vec3;
  heading: number;
  width: number;
  length: number;
  minZ: number;
  maxZ: number;
}[] = [
  {
    center: { x: 20.88, y: -1391.86, z: 29.33 },
    heading: 0,
    width: 5,
    length: 15,
    minZ: 27.33,
    maxZ: 34.33,
  },
  {
    center: { x: -699.83, y: -932.36, z: 19.02 },
    heading: 0,
    width: 10.4,
    length: 5.4,
    minZ: 17.02,
    maxZ: 23.02,
  },
  {
    center: { x: 1361.41, y: 3594.58, z: 34.9 },
    heading: 109,
    width: 8.8,
    length: 13.0,
    minZ: 33.9,
    maxZ: 37.9,
  },
  {
    center: { x: 2520.9, y: 4197.1, z: 39.9 },
    heading: 326,
    width: 8.8,
    length: 13.0,
    minZ: 38.9,
    maxZ: 42.9,
  },
];

let inCarwash = false;
export const isInCarwash = () => inCarwash;

export const loadCarwashZones = () => {
  carwashZones.forEach((zone, id) => {
    PolyZone.addBoxZone(
      'carwash',
      zone.center,
      zone.width,
      zone.length,
      {
        minZ: zone.minZ,
        maxZ: zone.maxZ,
        heading: zone.heading,
        data: {
          id,
        },
      },
      true
    );
    BlipManager.addBlip({
      category: 'dg-vehicles',
      id: `carwash-${id}`,
      text: 'Carwash',
      coords: zone.center,
      sprite: 100,
      color: 0,
      scale: 0.9,
    });
  });
  console.log(`[Carwash] Locations have been loaded`);
};

PolyZone.onEnter('carwash', () => {
  if (!getCurrentVehicle() || !isDriver()) return;
  inCarwash = true;
  UI.showInteraction(`${Keys.getBindedKey('+GeneralUse')} - Wash`);
});
PolyZone.onLeave('carwash', () => {
  inCarwash = false;
  UI.closeApplication('interaction');
});

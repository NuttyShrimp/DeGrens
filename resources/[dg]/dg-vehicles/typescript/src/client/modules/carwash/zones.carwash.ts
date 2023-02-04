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

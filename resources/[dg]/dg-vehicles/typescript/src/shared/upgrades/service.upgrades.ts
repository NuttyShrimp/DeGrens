import { cosmeticKeysToId } from './constants.upgrades';

export const generateBaseUpgrades = (ent?: number): Vehicles.Upgrades.Cosmetic => {
  const [prim, sec] = ent ? GetVehicleColours(ent) : [0, 0];
  const [pearlescentColor, wheelColor] = ent ? GetVehicleExtraColours(ent) : [0, 0];
  const idUpgrades: Partial<Record<keyof Vehicles.Upgrades.Cosmetic, number>> = {};
  (Object.keys(cosmeticKeysToId) as (keyof Vehicles.Upgrades.CosmeticModIds)[]).forEach(k => {
    idUpgrades[k] = -1;
  });
  return {
    ...idUpgrades,
    xenon: {
      active: false,
      color: -1,
    },
    tyreSmokeColor: -1,
    wheels: {
      id: -1,
      custom: false,
      type: ent && DoesEntityExist(ent) ? GetVehicleWheelType(ent) : 0,
    },
    neon: {
      enabled: [0, 1, 2, 3].map(id => ({ id, toggled: false })),
      color: {
        r: 255,
        g: 0,
        b: 255,
      },
    },
    primaryColor: prim,
    secondaryColor: sec,
    interiorColor: ent ? GetVehicleInteriorColour(ent) : 0,
    dashboardColor: ent ? GetVehicleDashboardColour(ent) : 0,
    pearlescentColor,
    wheelColor,
    extras: [...Array(14)].map((_, i) => ({
      id: i + 1,
      enabled: false,
    })),
    livery: -1,
    plateColor: ent ? GetVehicleNumberPlateTextIndex(ent) : 0,
    windowTint: 0,
  } as Vehicles.Upgrades.Cosmetic;
};

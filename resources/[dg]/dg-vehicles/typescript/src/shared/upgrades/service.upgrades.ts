import { NORMAL_COSMETIC_KEYS_TO_ID } from './constants.upgrades';

const RANDOM_COLORS = [
  // black
  0,
  // gray
  4,
  // red
  27,
  // orange
  38,
  // dark blue
  64,
  // light blue
  70,
  // green
  53,
  // lime
  92,
  // brown
  102,
];

export const generateBaseCosmeticUpgrades = (
  randomColor = false,
  enableExtras = false
): Vehicles.Upgrades.Cosmetic.Upgrades => {
  const primaryColor = randomColor ? RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)] : 0;
  return {
    ...(Object.keys(NORMAL_COSMETIC_KEYS_TO_ID) as Vehicles.Upgrades.Cosmetic.NormalKey[]).reduce((acc, k) => {
      acc[k] = -1;
      return acc;
    }, {} as Pick<Vehicles.Upgrades.Cosmetic.Upgrades, Vehicles.Upgrades.Cosmetic.NormalKey>),
    xenon: {
      active: false,
      color: -1,
    },
    tyreSmokeColor: -1,
    wheels: {
      id: -1,
      custom: false,
      type: 0,
    },
    neon: {
      enabled: [0, 1, 2, 3].map(id => ({ id, toggled: false })),
      color: {
        r: 255,
        g: 0,
        b: 255,
      },
    },
    primaryColor,
    secondaryColor: 0,
    interiorColor: 0,
    dashboardColor: 0,
    pearlescentColor: 0,
    wheelColor: 0,
    extras: [...Array(14)].map((_, i) => ({
      id: i + 1,
      enabled: enableExtras,
    })),
    livery: -1,
    plateColor: -1,
    windowTint: 0,
  };
};

export const generateBasePerformanceUpgrades = (): Vehicles.Upgrades.Performance.Upgrades => ({
  armor: -1,
  brakes: -1,
  engine: -1,
  transmission: -1,
  turbo: false,
  suspension: -1,
});

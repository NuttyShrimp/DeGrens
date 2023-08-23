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

export const generateBaseCosmeticUpgrades: {
  (includePrimaryColor: true, enableExtras?: boolean): Vehicles.Upgrades.Cosmetic.Upgrades;
  (includePrimaryColor?: false, enableExtras?: boolean): Omit<Vehicles.Upgrades.Cosmetic.Upgrades, 'primaryColor'>;
} = <T extends Vehicles.Upgrades.Cosmetic.Upgrades | Omit<Vehicles.Upgrades.Cosmetic.Upgrades, 'primaryColor'>>(
  includeColors = false,
  enableExtras = false
): T => {
  return {
    ...(Object.keys(NORMAL_COSMETIC_KEYS_TO_ID) as Vehicles.Upgrades.Cosmetic.NormalKey[]).reduce(
      (acc, k) => {
        acc[k] = -1;
        return acc;
      },
      {} as Pick<Vehicles.Upgrades.Cosmetic.Upgrades, Vehicles.Upgrades.Cosmetic.NormalKey>
    ),
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
    primaryColor: includeColors ? RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)] : undefined,
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
    plateColor: 0,
    windowTint: 0,
  } as T;
};

export const generateBasePerformanceUpgrades = (): Vehicles.Upgrades.Performance.Upgrades => ({
  armor: -1,
  brakes: -1,
  engine: -1,
  transmission: -1,
  turbo: false,
  suspension: -1,
});

/**
 * @param upgrades order from low to high priority
 */
export const mergeUpgrades = <T extends Partial<Vehicles.Upgrades.Upgrades>>(
  ...upgrades: Partial<Vehicles.Upgrades.Upgrades>[]
): T => {
  const mergedUpgrades: Partial<Vehicles.Upgrades.Upgrades> = { extras: [], ...upgrades[0] };
  for (let i = 1; i < upgrades.length; i++) {
    for (const key of Object.keys(upgrades[i]) as Partial<Vehicles.Upgrades.Key>[]) {
      if (key === 'extras') {
        for (const newExtra of upgrades[i][key] ?? []) {
          const extraIdx = (mergedUpgrades.extras ??= []).findIndex(e => e.id === newExtra.id) ?? -1;
          if (extraIdx === -1) {
            mergedUpgrades.extras.push(newExtra);
          } else {
            mergedUpgrades.extras[extraIdx].enabled = newExtra.enabled;
          }
        }
      } else {
        //@ts-expect-error
        mergedUpgrades[key] = upgrades[i][key];
      }
    }
  }
  return mergedUpgrades as T;
};

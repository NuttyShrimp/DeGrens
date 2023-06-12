export const TUNE_PARTS: Record<
  Vehicles.Upgrades.Tune,
  {
    amount: number;
    label: string;
    itemName: string;
  }
> = {
  brakes: {
    amount: 3,
    label: 'Remmen',
    itemName: 'tune_brakes',
  },
  engine: {
    amount: 4,
    label: 'Motor',
    itemName: 'tune_engine',
  },
  transmission: {
    amount: 3,
    label: 'Transmissie',
    itemName: 'tune_transmission',
  },
  turbo: {
    amount: 1,
    label: 'Turbo',
    itemName: 'tune_turbo',
  },
  suspension: {
    amount: 4,
    label: 'Ophanging',
    itemName: 'tune_suspension',
  },
};

// Only cosmetic upgrades that can be applyed using SetVehicleMod
export const NORMAL_COSMETIC_KEYS_TO_ID: Record<Vehicles.Upgrades.Cosmetic.NormalKey, number> = {
  spoiler: 0,
  frontBumper: 1,
  rearBumper: 2,
  sideSkirt: 3,
  exhaust: 4,
  frame: 5,
  grille: 6,
  hood: 7,
  leftFenders: 8,
  rightFenders: 9,
  roof: 10,
  horn: 14,
  subwoofer: 19,
  plateHolder: 25,
  vanityPlate: 26,
  trimA: 27,
  trimB: 44,
  ornaments: 28,
  dashboard: 29,
  dial: 30,
  doorSpeakers: 31,
  seats: 32,
  steeringWheel: 33,
  shiftLever: 34,
  plaques: 35,
  speakers: 36,
  trunk: 37,
  engineHydraulics: 38,
  engineBlock: 39,
  airFilter: 40,
  struts: 41,
  archCover: 42,
  aerials: 43,
  tank: 45,
  door: 46,
};

export const COSMETIC_KEYS_TO_ID: Record<Vehicles.Upgrades.Cosmetic.ExtendedKey, number> = {
  ...NORMAL_COSMETIC_KEYS_TO_ID,
  tyreSmokeColor: 20,
  wheels: 23,
  livery: 48,
  xenon: 22,
};

// Only performance upgrades that can be applyed using setvehiclemod
export const NORMAL_PERFORMANCE_KEYS_TO_ID: Record<Vehicles.Upgrades.Performance.NormalKey, number> = {
  armor: 16,
  brakes: 12,
  engine: 11,
  transmission: 13,
  suspension: 15,
};

export const PERFORMANCE_KEYS_TO_ID: Record<Vehicles.Upgrades.Performance.Key, number> = {
  ...NORMAL_PERFORMANCE_KEYS_TO_ID,
  turbo: 18,
};

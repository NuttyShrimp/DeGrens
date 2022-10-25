export const RELATION_GROUPS = [
  'AMBIENT_GANG_HILLBILLY',
  'AMBIENT_GANG_BALLAS',
  'AMBIENT_GANG_MEXICAN',
  'AMBIENT_GANG_FAMILY',
  'AMBIENT_GANG_MARABUNTE',
  'AMBIENT_GANG_SALVA',
  'AMBIENT_GANG_LOST',
  'GANG_1',
  'GANG_2',
  'GANG_9',
  'GANG_10',
  'FIREMAN',
  'MEDIC',
  'COP',
  'PRISONER',
].map(i => GetHashKey(i));

// https://docs.fivem.net/natives/?_0xEB47EC4E34FB7EE1
export const BLACKLISTED_SCENARIO_TYPES = [
  'WORLD_VEHICLE_MILITARY_PLANES_SMALL',
  'WORLD_VEHICLE_MILITARY_PLANES_BIG',
  'WORLD_VEHICLE_AMBULANCE',
  'WORLD_VEHICLE_POLICE_NEXT_TO_CAR',
  'WORLD_VEHICLE_POLICE_CAR',
  'WORLD_VEHICLE_POLICE_BIKE',
];

// https://pastebin.com/Tvg2PRHU
export const BLACKLISTED_SCENARIO_GROUPS = [
  'ALAMO_PLANES',
  'ARMY_GUARD',
  'ARMY_HELI',
  'BLIMP',
  'GRAPESEED_PLANES',
  'Grapeseed_Planes',
  'LSA_Planes',
  'MP_POLICE',
  'POLICE_POUND1',
  'POLICE_POUND2',
  'POLICE_POUND3',
  'POLICE_POUND4',
  'POLICE_POUND5',
  'PRISON_TOWERS',
  'SANDY_PLANES',
];

export const DISABLED_CONTROLS = [36, 37, 81, 82, 99];

export const DENSITY_SETTINGS = {
  parked: 0.8,
  vehicle: 0.8,
  multiplier: 0.8,
  peds: 0.8,
  scenario: 0.8,
};

export const HIDDEN_HUD_COMPONENT = [1, 2, 3, 4, 7, 9, 13, 14, 17, 19, 20, 21, 22];

// https://docs.altv.mp/gta/articles/ped/flags.html
// https://wiki.rage.mp/index.php?title=Player_Config_Flags
export const PED_CONFIG_FLAGS: [number, boolean][] = [
  [241, true], // Disable engine auto stop when exiting driver
  [429, true], // Disable engine autostart
  [438, true], // Disable helmet armor
  [35, false], // Disable motorcycle helmet equipping
];

export const PLAYER_RELATIONSHIP_HASH = GetHashKey('PLAYER');

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
  'WORLD_VEHICLE_HELI_LIFEGUARD',
  'WORLD_VEHICLE_FIRE_TRUCK',
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
  'City_Banks',
  'DEALERSHIP',
  'FIB_GROUP_1',
  'FIB_GROUP_2',
  'KORTZ_SECURITY',
];

export const DISABLED_CONTROLS = [36, 37, 81, 82, 99];

export const DENSITY_SETTINGS = {
  parked: 0.8,
  vehicle: 0.7,
  multiplier: 0.7,
  peds: 0.8,
  scenario: 0.8,
};

// 14 is reticle
export const HIDDEN_HUD_COMPONENT = [1, 3, 4, 7, 9, 13, 14, 17, 19, 20, 21, 22];

// https://docs.altv.mp/gta/articles/ped/flags.html
// https://wiki.rage.mp/index.php?title=Player_Config_Flags
export const PED_CONFIG_FLAGS: [number, boolean][] = [
  [241, true], // Disable engine auto stop when exiting driver
  [429, true], // Disable engine autostart
  [438, true], // Disable helmet armor
  [35, false], // Disable motorcycle helmet equipping
];

export const PICKUP_HASHES = [
  `PICKUP_AMMO_BULLET_MP`,
  `PICKUP_AMMO_FIREWORK`,
  `PICKUP_AMMO_FLAREGUN`,
  `PICKUP_AMMO_GRENADELAUNCHER`,
  `PICKUP_AMMO_GRENADELAUNCHER_MP`,
  `PICKUP_AMMO_HOMINGLAUNCHER`,
  `PICKUP_AMMO_MG`,
  `PICKUP_AMMO_MINIGUN`,
  `PICKUP_AMMO_MISSILE_MP`,
  `PICKUP_AMMO_PISTOL`,
  `PICKUP_AMMO_RIFLE`,
  `PICKUP_AMMO_RPG`,
  `PICKUP_AMMO_SHOTGUN`,
  `PICKUP_AMMO_SMG`,
  `PICKUP_AMMO_SNIPER`,
  `PICKUP_ARMOUR_STANDARD`,
  `PICKUP_CAMERA`,
  `PICKUP_CUSTOM_SCRIPT`,
  `PICKUP_GANG_ATTACK_MONEY`,
  `PICKUP_HEALTH_SNACK`,
  `PICKUP_HEALTH_STANDARD`,
  `PICKUP_MONEY_CASE`,
  `PICKUP_MONEY_DEP_BAG`,
  `PICKUP_MONEY_MED_BAG`,
  `PICKUP_MONEY_PAPER_BAG`,
  `PICKUP_MONEY_PURSE`,
  `PICKUP_MONEY_SECURITY_CASE`,
  `PICKUP_MONEY_VARIABLE`,
  `PICKUP_MONEY_WALLET`,
  `PICKUP_PARACHUTE`,
  `PICKUP_PORTABLE_CRATE_FIXED_INCAR`,
  `PICKUP_PORTABLE_CRATE_UNFIXED`,
  `PICKUP_PORTABLE_CRATE_UNFIXED_INCAR`,
  `PICKUP_PORTABLE_CRATE_UNFIXED_INCAR_SMALL`,
  `PICKUP_PORTABLE_CRATE_UNFIXED_LOW_GLOW`,
  `PICKUP_PORTABLE_DLC_VEHICLE_PACKAGE`,
  `PICKUP_PORTABLE_PACKAGE`,
  `PICKUP_SUBMARINE`,
  `PICKUP_VEHICLE_ARMOUR_STANDARD`,
  `PICKUP_VEHICLE_CUSTOM_SCRIPT`,
  `PICKUP_VEHICLE_CUSTOM_SCRIPT_LOW_GLOW`,
  `PICKUP_VEHICLE_HEALTH_STANDARD`,
  `PICKUP_VEHICLE_HEALTH_STANDARD_LOW_GLOW`,
  `PICKUP_VEHICLE_MONEY_VARIABLE`,
  `PICKUP_VEHICLE_WEAPON_APPISTOL`,
  `PICKUP_VEHICLE_WEAPON_ASSAULTSMG`,
  `PICKUP_VEHICLE_WEAPON_COMBATPISTOL`,
  `PICKUP_VEHICLE_WEAPON_GRENADE`,
  `PICKUP_VEHICLE_WEAPON_MICROSMG`,
  `PICKUP_VEHICLE_WEAPON_MOLOTOV`,
  `PICKUP_VEHICLE_WEAPON_PISTOL`,
  `PICKUP_VEHICLE_WEAPON_PISTOL50`,
  `PICKUP_VEHICLE_WEAPON_SAWNOFF`,
  `PICKUP_VEHICLE_WEAPON_SMG`,
  `PICKUP_VEHICLE_WEAPON_SMOKEGRENADE`,
  `PICKUP_VEHICLE_WEAPON_STICKYBOMB`,
  `PICKUP_WEAPON_ADVANCEDRIFLE`,
  `PICKUP_WEAPON_APPISTOL`,
  `PICKUP_WEAPON_ASSAULTRIFLE`,
  `PICKUP_WEAPON_ASSAULTSHOTGUN`,
  `PICKUP_WEAPON_ASSAULTSMG`,
  `PICKUP_WEAPON_AUTOSHOTGUN`,
  `PICKUP_WEAPON_BAT`,
  `PICKUP_WEAPON_BATTLEAXE`,
  `PICKUP_WEAPON_BOTTLE`,
  `PICKUP_WEAPON_BULLPUPRIFLE`,
  `PICKUP_WEAPON_BULLPUPSHOTGUN`,
  `PICKUP_WEAPON_CARBINERIFLE`,
  `PICKUP_WEAPON_COMBATMG`,
  `PICKUP_WEAPON_COMBATPDW`,
  `PICKUP_WEAPON_COMBATPISTOL`,
  `PICKUP_WEAPON_COMPACTLAUNCHER`,
  `PICKUP_WEAPON_COMPACTRIFLE`,
  `PICKUP_WEAPON_CROWBAR`,
  `PICKUP_WEAPON_DAGGER`,
  `PICKUP_WEAPON_DBSHOTGUN`,
  `PICKUP_WEAPON_FIREWORK`,
  `PICKUP_WEAPON_FLAREGUN`,
  `PICKUP_WEAPON_FLASHLIGHT`,
  `PICKUP_WEAPON_GRENADE`,
  `PICKUP_WEAPON_GRENADELAUNCHER`,
  `PICKUP_WEAPON_GUSENBERG`,
  `PICKUP_WEAPON_GOLFCLUB`,
  `PICKUP_WEAPON_HAMMER`,
  `PICKUP_WEAPON_HATCHET`,
  `PICKUP_WEAPON_HEAVYPISTOL`,
  `PICKUP_WEAPON_HEAVYSHOTGUN`,
  `PICKUP_WEAPON_HEAVYSNIPER`,
  `PICKUP_WEAPON_HOMINGLAUNCHER`,
  `PICKUP_WEAPON_KNIFE`,
  `PICKUP_WEAPON_KNUCKLE`,
  `PICKUP_WEAPON_MACHETE`,
  `PICKUP_WEAPON_MACHINEPISTOL`,
  `PICKUP_WEAPON_MARKSMANPISTOL`,
  `PICKUP_WEAPON_MARKSMANRIFLE`,
  `PICKUP_WEAPON_MG`,
  `PICKUP_WEAPON_MICROSMG`,
  `PICKUP_WEAPON_MINIGUN`,
  `PICKUP_WEAPON_MINISMG`,
  `PICKUP_WEAPON_MOLOTOV`,
  `PICKUP_WEAPON_MUSKET`,
  `PICKUP_WEAPON_NIGHTSTICK`,
  `PICKUP_WEAPON_PETROLCAN`,
  `PICKUP_WEAPON_PIPEBOMB`,
  `PICKUP_WEAPON_PISTOL`,
  `PICKUP_WEAPON_PISTOL50`,
  `PICKUP_WEAPON_POOLCUE`,
  `PICKUP_WEAPON_PROXMINE`,
  `PICKUP_WEAPON_PUMPSHOTGUN`,
  `PICKUP_WEAPON_RAILGUN`,
  `PICKUP_WEAPON_REVOLVER`,
  `PICKUP_WEAPON_RPG`,
  `PICKUP_WEAPON_SAWNOFFSHOTGUN`,
  `PICKUP_WEAPON_SMG`,
  `PICKUP_WEAPON_SMOKEGRENADE`,
  `PICKUP_WEAPON_SNIPERRIFLE`,
  `PICKUP_WEAPON_SNSPISTOL`,
  `PICKUP_WEAPON_SPECIALCARBINE`,
  `PICKUP_WEAPON_STICKYBOMB`,
  `PICKUP_WEAPON_STUNGUN`,
  `PICKUP_WEAPON_SWITCHBLADE`,
  `PICKUP_WEAPON_VINTAGEPISTOL`,
  `PICKUP_WEAPON_WRENCH`,
].map(x => GetHashKey(x));

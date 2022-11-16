export const BLOCKED_GSR_WEAPONS = new Set(
  [
    'weapon_unarmed',
    'weapon_snowball',
    'weapon_stungun',
    'weapon_petrolcan',
    'weapon_hazardcan',
    'weapon_fireextinguisher',
    'weapon_flashlight',
    'weapon_grenade',
    'weapon_pipebomb',
    'weapon_switchblade',
    'weapon_wrench',
    'weapon_bat',
    'weapon_crowbar',
    'weapon_golfclub',
    'weapon_hatchet',
    'weapon_knife',
    'weapon_knuckle',
    'weapon_machete',
    'weapon_nightstick',
    'weapon_poolcue',
  ].map(w => GetHashKey(w))
);

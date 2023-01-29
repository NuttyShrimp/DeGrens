const allowedWeapons = [
  'WEAPON_UNARMED',
  'OBJECT', // Weaponhash during scenarios with prop
  // Animals
  'WEAPON_ANIMAL_RETRIEVER',
  'WEAPON_SMALL_DOG',
  'WEAPON_TIGER_SHARK',
  'WEAPON_HAMMERHEAD_SHARK',
  'WEAPON_KILLER_WHALE',
  'WEAPON_BOAR',
  'WEAPON_PIG',
  'WEAPON_COYOTE',
  'WEAPON_DEER',
  'WEAPON_HEN',
  'WEAPON_RABBIT',
  'WEAPON_CAT',
  'WEAPON_COW',
  'WEAPON_BIRD_CRAP',
];

export const ALWAYS_ALLOWED_WEAPONS = new Set(
  allowedWeapons.map(weapon => (typeof weapon === 'string' ? GetHashKey(weapon) >>> 0 : weapon))
);

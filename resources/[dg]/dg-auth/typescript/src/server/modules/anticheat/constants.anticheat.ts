// Unarmed, the weaponhash whenever a scenario is active, animal weapons are always allowed
const allowed_weapons = ['WEAPON_UNARMED', 966099553];

export const ALWAYS_ALLOWED_WEAPONS = new Set(
  allowed_weapons.map(weapon => (typeof weapon === 'string' ? GetHashKey(weapon) >>> 0 : weapon))
);

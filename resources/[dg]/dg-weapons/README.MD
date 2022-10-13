# Weapons
## Exports
### Client
- getCurrentWeaponData: Returns the current itemdata of the weapon player has equipped or null  
- showReticle: Sets visibility of reticle to provided boolean  
- removeWeapon: Remove weapon player has equipped, provide itemId to only remove if that weapon is equipped, provide boolean to skip anim or not  
### Server
- forceSetQuality: Set quality of weapon player has equipped  

## Weapon Data

```ts
interface WeaponData {
  name: string; // Weapon Name
  durabilityMultiplier: number; // Multiplier for durability, can be 0 for unlimited durability
  noHolstering?: bool; // Should this weapon have a holstering animation
  unlimitedAmmo?: bool; // Should this weapon have unlimited ammo
  oneTimeUse?: bool; // Should this weapon be removed after usage
  attachments?: {[itemName: string] : string}
}
```

```ts
// TODO: Anticheat - Non-obtainable weapons: 
[
  'weapon_assaultrifle_mk2',
  'weapon_assaultshotgun',
  'weapon_ball',
  'weapon_battleaxe',
  'weapon_bottle',
  'weapon_bread',
  'weapon_briefcase',
  'weapon_briefcase_02',
  'weapon_bullpuprifle',
  'weapon_bullpuprifle_mk2',
  'weapon_bullpupshotgun',
  'weapon_bzgas',
  'weapon_carbinerifle_mk2',
  'weapon_ceramicpistol',
  'weapon_combatmg',
  'weapon_combatmg_mk2',
  'weapon_combatpdw',
  'weapon_combatpistol',
  'weapon_combatshotgun',
  'weapon_compactlauncher',
  'weapon_compactrifle',
  'weapon_dagger',
  'weapon_dbshotgun',
  'weapon_doubleaction',
  'weapon_firework',
  'weapon_flare',
  'weapon_flaregun',
  'weapon_grenadelauncher',
  'weapon_grenadelauncher_smoke',
  'weapon_gusenberg',
  'weapon_hammer',
  'weapon_hazardcan',
  'weapon_heavyshotgun',
  'weapon_heavysniper',
  'weapon_heavysniper_mk2',
  'weapon_hominglauncher',
  'weapon_marksmanrifle',
  'weapon_marksmanrifle_mk2',
  'weapon_mg',
  'weapon_militaryrifle',
  'weapon_minigun',
  'weapon_minismg',
  'weapon_molotov',
  'weapon_musket',
  'weapon_navyrevolver',
  'weapon_pistol50',
  'weapon_pistol_mk2',
  'weapon_proxmine',
  'weapon_pumpshotgun_mk2',
  'weapon_railgun',
  'weapon_raycarbine',
  'weapon_rayminigun',
  'weapon_raypistol',
  'weapon_remotesniper',
  'weapon_revolver',
  'weapon_revolver_mk2',
  'weapon_sawnoffshotgun',
  'weapon_smg_mk2',
  'weapon_smokegrenade',
  'weapon_snspistol',
  'weapon_snspistol_mk2',
  'weapon_specialcarbine_mk2',
  'weapon_stickybomb',
  'weapon_stone_hatchet',
  'weapon_vintagepistol'
]
```

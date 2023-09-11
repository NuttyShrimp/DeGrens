type Coords = Vec3;

interface RGB {
  r: number;
  g: number;
  b: number;
}

declare type RayCastHit = {
  entity?: number;
  coords?: Vec3;
};

declare type StatusName = 'alcohol' | 'gsw' | 'gsr' | 'bruises' | 'burns' | 'drowned' | 'stabwound';

declare type ReputationType =
  | 'crafting'
  | 'ammo_crafting'
  | 'mechanic_crafting'
  | 'cornersell'
  | 'blazeit_crafting'
  | 'kingpills_crafting'
  | 'carboost_crafting'
  | 'carboosting';

declare type BadgeType = 'police';

declare type CharacterNeed = 'thirst' | 'hunger';

type WeaponDamageEventData = {
  actionResultId: number;
  actionResultName: number;
  damageFlags: number;
  damageTime: number;
  damageType: number;
  f104: number;
  f112: boolean;
  f112_1: number;
  f120: number;
  f133: boolean;
  hasActionResult: boolean;
  hasImpactDir: boolean;
  hasVehicleData: boolean;
  hitComponent: number;
  hitEntityWeapon: boolean;
  hitGlobalId: number;
  hitGlobalIds: number[];
  hitWeaponAmmoAttachment: boolean;
  impactDirX: number;
  impactDirY: number;
  impactDirZ: number;
  isNetTargetPos: boolean;
  localPosX: number;
  localPosY: number;
  localPosZ: number;
  overrideDefaultDamage: boolean;
  parentGlobalId: number;
  silenced: boolean;
  suspensionIndex: number;
  tyreIndex: number;
  weaponDamage: number;
  weaponType: number;
  willKill: boolean;
};

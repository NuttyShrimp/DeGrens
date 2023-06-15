type Coords = Vec3;

interface RGB {
  r: number;
  g: number;
  b: number;
}

declare type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

declare namespace Particles {
  type Particle = {
    dict: string;
    name: string;
    offset?: Vec3;
    rotation?: Vec3;
    scale?: number;
    looped: boolean;
  } & (
    | { coords: Vec3 }
    | { netId: number }
    | ({ netId: number; ignoreBoneRotation?: boolean } & ({ boneName: string } | { boneIndex: number }))
  );

  // only looped return ptfx handle
  type Data = Required<Particle> & { ptfx?: number };
}

declare type RayCastHit = {
  entity?: number;
  coords?: Vec3;
};

declare type StatusName = 'alcohol' | 'gsw' | 'gsr' | 'bruises' | 'burns' | 'drowned' | 'stabwound';

declare type ReputationType = 'crafting' | 'ammo_crafting' | 'mechanic_crafting' | 'cornersell' | 'blazeit_crafting';

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

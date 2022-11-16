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
  } & ({ coords: Vec3 } | { netId: number } | { netId: number; boneName: string; ignoreBoneRotation?: boolean });

  // only looped return ptfx handle
  type Data = Required<Particle> & { ptfx?: number };
}

declare type GangData = {
  name: string;
  label: string;
  owner: number;
  members: { name: string; cid: number; hasPerms: boolean }[];
};

declare type RayCastHit = {
  entity?: number;
  coords?: Vec3;
};

declare type StatusName = 'alcohol' | 'gsw' | 'gsr';

declare type ReputationType = 'crafting' | 'ammo_crafting' | 'mechanic_crafting';

declare type BadgeType = 'police';

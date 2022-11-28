interface ResourceTokenData {
  timeStamp: number;
  resource: string;
  steamId: string;
}

declare namespace AntiCheat {
  interface Config {
    blockedModels: string[];
    explosions: { name: string, block: boolean }[]
  }

  interface WeaponInfo {
    // weapon Hash
    weapon: number;
    ammo: number;
    damageModifier: number;
  }

  interface ExplosionEventInfo {
    explosionType: number;
    isAudible: boolean;
    posX: number;
    posY: number;
    posZ: number;
    cameraShake: number;
    isInvisible: boolean;
    ownerNetId: number;
    damageScale: number;
  }
}

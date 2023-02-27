interface ResourceTokenData {
  timeStamp: number;
  resource: string;
  steamId: string;
}

declare namespace AntiCheat {
  interface Config {
    afkKickMessage: string;
    blockedModels: string[];
    explosions: { name: string; block: boolean }[];
    alwaysAllowedWeapons: (string | number)[];
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

  interface EntityDamage {
    attacker: number | string;
    victim: number | string;
    weaponHash: number;
    headshot: boolean;
  }
}

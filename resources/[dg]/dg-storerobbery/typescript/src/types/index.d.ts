declare namespace Storerobbery {
  type Config = {
    register: {
      refillTime: number;
      rollAmount: [number, number];
    };
    safe: {
      crackDelay: number;
      refillTime: number;
      specialItemChance: number;
      rollAmount: [number, number];
      qualityDecrease: number;
    };
    stores: Record<Id, Data>;
  };

  interface Data {
    registerzone: Zone;
    storezone: Zone;
    safecoords: Vec3;
    cam: number;
  }

  type Id =
    | 'little_seoul'
    | 'grove_street'
    | 'mirror_park'
    | 'richman_glen'
    | 'grape_seed'
    | 'vespucci_canals'
    | 'grand_senora'
    | 'murrieta_heights'
    | 'del_perro'
    | 'great_ocean'
    | 'banham_canyon'
    | 'chumash'
    | 'senora_freeway'
    | 'strawberry'
    | 'harmony'
    | 'vinewood'
    | 'mount_chiliad'
    | 'sandy_shores'
    | 'tataviam_mountains'
    | 'del_vecchio'
    | 'paleto_bay'
    | 'ottos_garage';

  type SafeState = 'closed' | 'decoding' | 'opened' | 'looted';

  type Zone = {
    center: Vec3;
    width: number;
    length: number;
    options: {
      heading: number;
      minZ: number;
      maxZ: number;
    };
  };
}

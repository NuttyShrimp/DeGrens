declare namespace Store {
  interface Data {
    registerzone: IBoxZone;
    storezone: IBoxZone;
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
    | 'paleto_bay';
}

declare namespace Safe {
  type State = 'closed' | 'decoding' | 'opened' | 'looted';
}

declare interface IBoxZone {
  center: Vec3;
  width: number;
  length: number;
  options: {
    heading: number;
    minZ: number;
    maxZ: number;
  };
}

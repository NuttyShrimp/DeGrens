declare interface IConfig {
  shop: Shop.Config;
  laptops: Laptop.Config;
  trolleys: Trolley.Config;
  zones: Record<string, Heist.Zone>;
  doors: Record<string, Heist.Door>;
  metadata: Heist.Metadata;
}

declare namespace Heist {
  type Type = 'fleeca';
  type Id = Fleeca.Id | 'paleto' | 'maze' | 'pacific' | 'jewelry';

  interface Door {
    model: string;
    coords: Vec3;
    heading: {
      open: number;
      closed: number;
    };
    portalId?: number;
  }

  interface Zone {
    vectors: Vec2[];
    options: {
      data?: Object;
      minZ: number;
      maxZ: number;
    };
  }

  interface StateManager {
    canHack(src: number, heistId: Heist.Id): boolean;
    startHack(src: number, heistId: Heist.Id): void;

    failedHack(src: number, heistId: Heist.Id): void;
    finishedHack(src: number, heistId: Heist.Id): boolean;
  }

  interface Metadata {
    type: Record<Type, Heist.Id[]>;
    labels: Record<Heist.Id, string>;
    cams: Record<Heist.Id, number>;
  }
}

declare namespace Shop {
  type Config = Record<Shop.Name, { text: string; laptop: string; cost: number }>;
  type Name = 'drive_v1' | 'drive_v2' | 'drive_v3' | 'drive_v5' | 'thermite_part' | 'mini_emp_part';
}

declare namespace Laptop {
  type Name = 'laptop_v1' | 'laptop_v2' | 'laptop_v3' | 'laptop_v5';

  type Config = {
    hackDelay: number;
    pickup: Vec3;
    coords: Record<Name, Record<Heist.Id, Vec4>>;
  };
}

declare namespace Trolley {
  interface Config {
    heists: Partial<Record<Heist.Type, Trolley.Loot>>;
    locations: Record<Heist.Id, Data[]>;
  }
  type Type = 'cash' | 'gold' | 'diamonds';

  interface Data {
    coords: Vec4;
    spawnChance: number;
    type: Trolley.Type;
  }

  interface Loot {
    types: Partial<Record<Type, { name: string; min: number; max: number }[]>>;
    specialChance: number;
    specialItems: string[];
  }
}

declare interface ContextMenuEntry {
  title: string;
  icon?: string;
  callbackURL?: string;
  data?: Object;
}

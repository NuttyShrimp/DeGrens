declare interface IConfig {
  drives: Drives.Config;
  laptops: Laptop.Config;
  trolleys: Trolley.Config;
  fleeca: Fleeca.Config;
  paleto: Paleto.Config;
  maze: Maze.Config;
  pacific: Pacific.Config;
  jewelry: Jewelry.Config;
  zones: Record<Heist.Id, Heist.Zone>;
  doors: Partial<Record<Heist.Id, Heist.Door>>;
}

declare namespace Heist {
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
    canHack(heistId: Heist.Id): boolean;
    finishedHack(heistId: Heist.Id): void;
  }
}

declare namespace Drives {
  type Config = Record<Drives.Name, { text: string; laptop: string; cost: number }>;
  type Name = 'drive_v1' | 'drive_v2' | 'drive_v3' | 'drive_v5' | 'thermite_part' | 'mini_emp_part';
}

declare namespace Laptop {
  type Config = {
    interactCoords: Record<Laptop.Name, Vec4[]>;
    hackDelay: number;
    pickup: Vec3;
  };
  type Name = 'laptop_v1' | 'laptop_v2' | 'laptop_v3' | 'laptop_v5';
}

declare namespace Trolley {
  type Config = Partial<Record<Heist.Id, Trolley.Loot & { locations: Data[] }>>;
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

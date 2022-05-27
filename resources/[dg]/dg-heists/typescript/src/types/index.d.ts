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
}

declare namespace Drives {
  type Name = 'drive_v1' | 'drive_v2' | 'drive_v3' | 'drive_v5';
}

declare namespace Laptop {
  type Name = 'laptop_v1' | 'laptop_v2' | 'laptop_v3' | 'laptop_v5';
}

declare namespace Trolley {
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

declare interface OpeningData {
  items: Inventory.ItemState[];
  primary: {
    id: string;
    size: number;
    cash: number;
  };
  secondary: {
    id: string;
  } & (
    | {
        size: number;
        allowedItems?: string[];
      }
    | {
        shopItems: Shops.Item[];
      }
  );
}

declare namespace Repository {
  interface FetchResult extends Omit<Inventory.ItemState, 'metadata' | 'position'> {
    metadata: string;
    position: string;
  }

  type UpdateParameters = (string | number | null)[];
}

declare type ItemBuildData = Partial<Inventory.ItemState> &
  Pick<Inventory.ItemState, 'name' | 'inventory' | 'metadata'>;

declare type IdBuildData =
  | {
      type: Inventory.Type;
      identifier?: string;
      data?: unknown;
    }
  | {
      override: string; // Skip all id building, used for opening id from adminmenu
    };

declare namespace Location {
  interface Drop {
    pos: Vec3;
    activated: boolean;
    timeout?: NodeJS.Timeout;
  }

  interface Dumpster {
    pos: Vec3;
  }

  type Locations = {
    drop: Map<string, Drop>;
    dumpster: Map<string, Dumpster>;
  };

  type Type = 'drop' | 'dumpster';
}

interface InventoryConfig {
  cellsPerRow: number;
  amountOfSlots: {
    [key in Inventory.Type]: number;
  };
  trunkSlots: {
    [key: string]: number;
  };
  persistentTypes: Inventory.Type[];
  vehicleTypes: Inventory.Type[];
  locationInvRange: {
    [key in Location.Type]: number;
  };
  dropRemoveTime: number;
  itemObjects: {
    [key: string]: Objects.Info | undefined;
  };
  starterItems: string[];
  containers: {
    [key: string]: {
      allowedItems: string[];
      size: number;
    };
  };
}

declare namespace Objects {
  interface Info {
    name: string;
    type: 'primary' | 'secondary';
    animData?: {
      animDict: string;
      anim: string;
    };
  }

  interface Obj {
    itemId: string;
    info: Info;
  }

  type Active = {
    propId: number | null;
    info: Objects.Info;
  };
}

declare namespace Shops {
  interface Item {
    name: string;
    label: string;
    image: string;
    size: Vec2;
    amount: number;
    requirements: Inventory.Requirements;
  }

  interface Config {
    types: {
      [key: string]: {
        name: string;
        amount: number;
        price: number;
      }[];
    };
    shops: {
      [key: string]: { type: string };
    };
  }
}

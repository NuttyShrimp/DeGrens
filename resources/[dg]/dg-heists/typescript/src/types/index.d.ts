declare namespace Heists {
  type Config = {
    locations: Record<LocationId, Location>;
    shop: Shop.Config;
    laptops: Laptops.Config;
    types: Partial<Record<HeistType, Type>>;
    fleeca: Fleeca.Config;
    paleto: Paleto.Config;
    jewelry: Jewelry.Config;
  };

  type InitData = {
    shopPickupZone: Shop.Config['pickupZone'];
    locations: ({
      id: LocationId;
    } & Pick<Location, 'zone' | 'policeDoorReset'>)[];
    paletoActions: Paleto.Config['actions'];
    jewelry: Jewelry.InitData;
  };

  type HeistType = 'fleeca' | 'paleto' | 'jewelry'; //| 'maze' | 'pacific' | 'bobcat';
  type Type = {
    trolley: Trolley.Config;
  };

  type LocationId = Fleeca.Id | 'paleto' | 'jewelry'; //| 'maze' | 'pacific' | 'bobcat';
  type Location = {
    type: HeistType;
    label: string;
    cams: number[];
    zone: {
      points: Vec2[];
      minZ: number;
      maxZ: number;
    };
    door?: Door.Config;
    laptopCoords?: Vec4;
    trolleys?: {
      coords: Vec4;
      type: Trolley.Type;
    }[];
    policeDoorReset?: Vec4;
  };

  type Service = 'door' | 'laptop' | 'trolleys';

  type TypeManager = {
    initialize?: () => void;
    canHack?: () => boolean;
    startedHack?: () => void;
    finishedHack?: (success: boolean) => void;
  };

  namespace Door {
    type State = 'open' | 'closed';

    type Config = {
      model: string;
      coords: Vec3;
      portalId?: number;
      heading?: Record<State, number>;
      isRayfireObject?: boolean;
    };
  }

  namespace Shop {
    type Config = {
      pickupZone: Vec4;
      requiredReputation: number;
      items: Item[];
    };

    type Item = {
      item: string;
      price: number;
      requiredItem?: string;
      activityName?: string;
    };
  }

  namespace Laptops {
    type Config = {
      hackDuration: number;
      laptops: Record<
        string,
        {
          heistType: HeistType;
          gridSize: number;
          time: number;
        }
      >;
    };
  }

  namespace Trolley {
    type Type = 'cash' | 'gold' | 'diamonds';

    type Config = {
      types: Partial<Record<Type, { itemName: string; amount: [number, number]; spawnChance: number }>>;
      specialItem?: {
        chance: number;
        item: string;
      };
    };

    type Data = {
      type: Type;
      locationId: LocationId;
      lootingPlayer: number | null;
    };
  }
}

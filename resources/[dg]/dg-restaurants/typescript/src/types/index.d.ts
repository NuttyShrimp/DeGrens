declare namespace Restaurants {
  type Config = {
    maxPerTicket: number;
    sharedPercentage: number;
    restaurants: Record<string, RestaurantConfig>;
  };

  type RestaurantConfig = {
    label: string;
    restaurantZone: {
      points: Vec2[];
      minZ: number;
      maxZ: number;
    };
    managementZone: BoxZone;
    stashZone: BoxZone;
    registerZones: BoxZone[];
    cooking: {
      peekLabel: string;
      from: string;
      to: string;
      zone: BoxZone;
    }[];
    items: Record<
      string,
      {
        zone: BoxZone;
        peekLabel: string;
        requiredItems: string[];
        isLeftover?: boolean;
      }
    >;
    leftoverZone: BoxZone;
  };

  type MenuItem = {
    item: string;
    label: string;
    price: number;
    requiredItems: string[];
    isLeftover: boolean;
  };

  type BoxZone = {
    center: Vec3;
    length: number;
    width: number;
    options: {
      heading: number;
      minZ: number;
      maxZ: number;
    };
  };

  type Order = {
    items: OrderItem[];
    registerId: number;
    paid: boolean;
    paidBy?: string;
  };

  type OrderItem = {
    item: string;
    made: boolean;
    quality: number;
  };
}

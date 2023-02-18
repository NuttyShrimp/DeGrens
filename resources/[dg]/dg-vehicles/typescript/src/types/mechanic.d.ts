declare namespace Mechanic {
  namespace NConfig {
    interface BoxZone {
      coords: Vec3;
      width: number;
      length: number;
      height: number;
      heading: number;
    }

    interface Locations {
      label: string;
      board: BoxZone;
      bench: BoxZone;
      repair: BoxZone;
    }
  }

  type Shops = Record<string, NConfig.Locations>;

  interface Config {
    towingTicketPrice: number;
    // Model to offsets
    towVehicles: Record<string, Vec3>;
    reward: {
      parts: Record<Tickets.PerformanceItemPart | Tickets.RepairItemPart, number>;
      class: Record<CarClass, number>;
      type: Record<Tickets.ItemType, number>;
    };
    shops: Shops;
  }

  namespace Tickets {
    type ItemType = 'repair' | 'upgrade_1' | 'upgrade_2' | 'upgrade_3';
    type PerformanceItemPart = 'suspension' | 'engine' | 'transmission' | 'brakes';
    type RepairItemPart = 'axle' | 'brakes' | 'suspension' | 'engine';

    interface BaseItem {
      class: CarClass;
      amount: number;
    }

    interface RepairItem extends BaseItem {
      type: 'repair';
      part: RepairItemPart;
    }

    interface PerformanceItem extends BaseItem {
      type: Exclude<ItemType, 'repair'>;
      part: PerformanceItemPart;
    }

    type Item = PerformanceItem | RepairItem;

    type ExtItem = Item & { ids: string[]; name: string };

    // This is metadata of sales_ticket
    interface ItemMetadata {
      items: ExtItem[];
    }
  }
}

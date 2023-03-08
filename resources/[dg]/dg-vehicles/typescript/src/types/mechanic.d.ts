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
    reputationPerClass: number;
    // Model to offsets
    towVehicles: Record<string, Vec3>;
    reward: {
      repair: {
        parts: Record<Service.Part, number>;
      };
      tune: {
        parts: Record<Upgrades.Tune, number>;
        stageModifier: Record<number, number>;
      };
      classModifier: Record<CarClass, number>;
    };
    shops: Shops;
  }

  type PartType = 'repair' | 'tune';

  type PartItem = { class: CarClass } & (
    | { type: 'repair'; part: Service.Part }
    | { type: 'tune'; part: Upgrades.Tune; stage: number }
  );

  type TicketMetadata = {
    items: {
      itemId: string;
      amount: number;
      type: PartType;
    }[];
  };
}

declare namespace Mechanic {
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
        parts: Record<Vehicles.Upgrades.Tune, number>;
        stageModifier: Record<number, number>;
      };
      classModifier: Record<Vehicles.Class, number>;
    };
  }

  type PartType = 'repair' | 'tune';

  type PartItem = { class: Vehicles.Class } & (
    | { type: 'repair'; part: Service.Part }
    | { type: 'tune'; part: Vehicles.Upgrades.Tune; stage: number }
  );

  type TicketMetadata = {
    items: {
      itemId: string;
      amount: number;
      type: PartType;
    }[];
  };
}

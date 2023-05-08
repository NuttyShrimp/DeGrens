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
        parts: Record<Upgrades.Tune, number>;
        stageModifier: Record<number, number>;
      };
      classModifier: Record<CarClass, number>;
    };
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

declare namespace Fishing {
  type Config = {
    vehicle: Record<
      JobType,
      {
        coords: Vec4;
        size: number;
      }
    >;
    spots: Record<JobType, Vec3[]>;
    specialLoot: {
      chance: number;
      items: { name: string; amount: number }[];
    };
  };

  type JobType = 'boat' | 'car';

  type Job = {
    vin: string;
    location: Vec3;
    jobType: JobType;
    fishPerCid: Map<number, number>;
    maxFish: number;
    payoutLevel: number;
  };
}

declare namespace Fishing {
  type Config = {
    vehicle: Record<JobType, Vec4>;
    spots: Record<JobType, Vec3[]>;
    specialLoot: {
      chance: number;
      items: { name: string; amount: number }[];
    };
  };

  type JobType = 'boat' | 'car';

  type Job = {
    netId: number;
    location: Vec3;
    jobType: JobType;
    fishPerCid: Map<number, number>;
  };
}

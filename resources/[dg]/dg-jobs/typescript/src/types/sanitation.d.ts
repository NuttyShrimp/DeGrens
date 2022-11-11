declare namespace Sanitation {
  type Config = {
    amountOfLocationsPerJob: number;
    vehicleLocation: Vec4;
    locations: Vec3[];
    loot: string[];
    specialLoot: string[];
  };

  type Job = {
    netId: number;
    locationsDone: number;
    location: {
      id: number;
      dumpsters: Vec3[] | null;
      totalDumpsters: number | null;
    };
  };
}

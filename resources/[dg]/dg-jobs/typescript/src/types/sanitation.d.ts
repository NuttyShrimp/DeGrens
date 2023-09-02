declare namespace Sanitation {
  type Config = {
    amountOfLocationsPerJob: number;
    vehicleLocation: Vec4;
    locations: { coords: Vec3; range: number; amount: number }[];
    recycleItems: { name: string; amount: number }[];
  };

  type Job = {
    vin: string;
    locationSequence: number[];
    dumpstersDone: Vec3[];
    payoutLevel: number;
  };
}

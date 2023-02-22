declare namespace Sanitation {
  type Config = {
    amountOfLocationsPerJob: number;
    vehicleLocation: Vec4;
    locations: { coords: Vec3; range: number; amount: number }[];
    lootChance: number;
    loot: string[];
    specialLoot: string[];
  };

  type Job = {
    vin: string;
    locationSequence: number[];
    dumpstersDone: Vec3[];
    bagsPerPlayer: Map<number, number>; // keeps track of amount of bags player has done for payout
    payoutLevel: number;
  };
}

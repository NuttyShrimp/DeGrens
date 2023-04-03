declare namespace Scrapyard {
  type Config = {
    partItems: string[];
    lootAmount: [number, number];
    loot: string[];
    returnZone: Vec4;
    models: string[];
    locations: Pick<Location, 'pedLocation' | 'vehicleLocation'>[];
  };

  type Location = {
    id: number;
    vehicleLocation: Vec4;
    pedLocation: Vec4;
  };

  type Job = Location & {
    vin: string;
    pedHandle: number | null;
    doorsDone: number[];
  };
}

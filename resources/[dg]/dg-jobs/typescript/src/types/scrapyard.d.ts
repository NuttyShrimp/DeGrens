declare namespace Scrapyard {
  type Config = {
    partItems: string[];
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
    netId: number;
    pedSpawned: boolean;
    doorsDone: number[];
  };
}

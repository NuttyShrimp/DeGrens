declare namespace Farming {
  type Config = {
    bucketFillAmount: number;
    defaultPlant: PlantModel;
    seeds: Record<string, Seed>;
    farmingZones: {
      vectors: Vec2[];
      minZ: number;
      maxZ: number;
    }[];
  };

  type Seed = PlantModel & {
    actions: Actions;
    growTime: number;
    product: string;
  };

  type PlantModel = {
    model: string;
    zOffset: number;
  };

  type ActivePlant = {
    coords: Vec3;
    canHarvest: boolean;
    seed: string;
    objectId: string;
    plantTime: number;
  };

  type ActionType = 'cut' | 'water' | 'feed' | 'feedDeluxe';

  type Actions = Record<ActionType, number | null>;
}

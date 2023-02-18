declare namespace Hunting {
  type Config = {
    animals: {
      model: string;
      item: string;
      chance: number;
      meatChance: number;
    }[];
    sellables: Record<string, number>;
    huntingZones: Vec2[][];
  };
}

declare namespace Hunting {
  type Config = {
    animals: {
      model: string;
      item: string;
      chance: number;
      meatAmount: number;
    }[];
    sellables: Record<string, number>;
    huntingZones: Vec2[][];
  };
}

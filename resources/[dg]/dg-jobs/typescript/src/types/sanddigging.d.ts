declare namespace Sanddigging {
  type Config = {
    sandAmount: [number, number];
    specialItemChance: {
      min: number;
      max: number;
    };
    specialItems: string[];
    vehicle: Vec4;
    spots: Vec3[];
  };
}

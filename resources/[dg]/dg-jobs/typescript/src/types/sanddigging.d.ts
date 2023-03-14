declare namespace Sanddigging {
  type Config = {
    specialItemChance: {
      min: number;
      max: number;
    };
    specialItems: string[];
    vehicle: Vec4;
    spots: Vec3[];
  };
}

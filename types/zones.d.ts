declare namespace Zones {
  type Box<T extends Record<string, any> | undefined = undefined> = {
    center: Vec3;
    width: number;
    length: number;
    options: {
      heading: number;
      minZ: number;
      maxZ: number;
      data: T;
    };
  };

  type Circle<T extends Record<string, any> | undefined = undefined> = {
    center: Vec3;
    radius: number;
    options: {
      useZ: boolean;
      data: T;
    };
  };

  type Poly<T extends Record<string, any> | undefined = undefined> = {
    vectors: Vec2[];
    options: {
      minZ: number;
      maxZ: number;
      data: T;
    };
  };
}

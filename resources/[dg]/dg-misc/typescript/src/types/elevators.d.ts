declare namespace Elevators {
  type Config = Record<
    string,
    {
      name: string;
      levels: Record<
        string,
        {
          name: string;
          interact: Vec3;
          spawn: Vec4;
          job?: { name: string; rank?: number }[];
          business?: { name: string; permissions?: string[] }[];
          gang?: string[];
        }
      >;
    }
  >;
}

declare interface ZoneData {
  vectors: Vec2[];
  options: {
    data: { id: string };
    minZ: number;
    maxZ: number;
  };
}

declare interface PowerstationData {
  center: Vec3;
  width: number;
  length: number;
  options: {
    heading: number;
    minZ: number;
    maxZ: number;
  };
}

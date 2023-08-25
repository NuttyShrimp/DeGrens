declare namespace BOILERPLATE {
  type Config = {};
}

declare type ZoneConfig = {
  name: string;
  origin: Vec3;
  radius: number;
  blipLocations: { coords: Vec3; width: number; height: number }[];
};

declare type ZoneState = {
  owner: string;
  counter: Dayjs;
  // gang to ply in zone
  plysInZone: Record<string, number[]>;
  thread: NodeJS.Timer | null;
  resetThread: NodeJS.Timer | null;
  contested: boolean;
};

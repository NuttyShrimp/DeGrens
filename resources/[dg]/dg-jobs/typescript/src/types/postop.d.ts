declare namespace PostOP {
  type Config = {
    vehicleLocation: Vec4;
    types: Record<
      JobType,
      {
        model: string;
        peekLabel: string;
        dropoffAmount: MinMax;
        locationsAmount: MinMax;
      }
    >;
    locations: Location[];
  };

  type Job = {
    netId: number;
    type: JobType;
    locationSequence: number[];
    targetLocation: TargetLocation;
    dropoffsBusy: Set<number>; // dropoffs where player is in taskbar
    dropoffsDone: Set<number>; // dropoffs that are done
    packagesByPlayer: Map<number, number>; // keeps track of amount of pakcages player has delivered
  };

  type JobType = 'small' | 'big';

  type Location = {
    center: Vec3;
    dropoffs: Vec3[];
  };

  type TargetLocation = Location & { id: number };

  type MinMax = { min: number; max: number };
}

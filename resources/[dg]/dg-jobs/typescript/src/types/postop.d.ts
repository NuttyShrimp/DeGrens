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
    vin: string;
    type: JobType;
    locationSequence: number[];
    targetLocation: TargetLocation;
    dropoffsBusy: Set<number>; // dropoffs where player is in taskbar
    dropoffsDone: Set<number>; // dropoffs that are done
    packagesByPlayer: Map<number, number>; // keeps track of amount of pakcages player has delivered
    totalLocations: number; // length of sequence at start for phone notif
    locationsDone: number; // easier to build phone notif because sequences gets modified before targetloc so is hard get amount from that
    payoutLevel: number;
  };

  type JobType = 'small' | 'big';

  type Location = {
    center: Vec3;
    dropoffs: Vec3[];
  };

  type TargetLocation = Location & { id: number };

  type MinMax = { min: number; max: number };
}

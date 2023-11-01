declare namespace Racing {
  type Config = {};
  type PileEntities = Record<'left' | 'right', number>;
  type RaceType = 'sprint' | 'lap';
  type Checkpoint = {
    center: Vec4;
    spread: number;
    entities?: PileEntities;
  };

  type RaceState = {
    id: number;
    trackId: number;
    leaderboard: boolean;
    classRestriction?: Vehicles.Class;
    creator: number;
    startTime: number;
    laps?: number;
    // Citizenid's
    participants: number[];
    state: 'pending' | 'running' | 'ending';
    kicked?: number[];
  };

  type ClientRaceState = Omit<
    RaceState,
    'trackId' | 'leaderboard' | 'creator' | 'state' | 'participants' | 'kicked'
  > & {
    participants: Record<number, number>;
  };
  type AppRaceState = Omit<RaceState, 'participants'> & {
    participants: { cid: number; name: string }[];
  };
  type RunningRaceState = {
    leaderboard: number[];
    // cid to lap to time passing the checkpoint
    passedPoints: Record<number, Record<number, number[]>>;
    finishers: number[];
    disqualified: number[];
    dnfTimer: NodeJS.Timer | null;
    cryptoDistribution?: Record<number, number>;
  };

  type Track = {
    checkpoints: Checkpoint[];
    id: number;
    name: string;
    type: RaceType;
    creator: number;
  };

  namespace Creator {
    type PendingRace = {
      name: string;
      type: RaceType;
      creator: number;
      id?: number;
    };
    type Options = {
      id: number;
      enabled: boolean;
      spread: number;
      checkpoints: Checkpoint[];
    };
  }
}

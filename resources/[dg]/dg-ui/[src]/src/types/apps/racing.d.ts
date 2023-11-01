declare namespace Racing {
  type State = {
    position: number;
    checkpoint: number;
    currentLap: number;
    totalCheckpoints: number;
    totalParticipants: number;
    totalLaps: number;
    bestLap: number; // in ms
    reset: () => void;
    setInfo: (data: Partial<State>) => void;
  };
}

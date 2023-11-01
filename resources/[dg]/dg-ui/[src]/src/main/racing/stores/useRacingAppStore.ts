import { create } from '@src/lib/store';

export const useRacingAppStore = create<Racing.State>('racing')(set => ({
  bestLap: 0,
  checkpoint: 1,
  position: 0,
  currentLap: 0,
  totalCheckpoints: 0,
  totalParticipants: 0,
  totalLaps: 0,
  reset: () => set({ bestLap: 0, checkpoint: 1, position: 0, totalCheckpoints: 0, totalParticipants: 0 }),
  setInfo: set,
}));

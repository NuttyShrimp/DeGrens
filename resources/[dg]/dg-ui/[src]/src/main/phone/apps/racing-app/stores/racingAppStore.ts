import { create } from '@src/lib/store';

export const useRacingAppStore = create<Phone.Racing.State>('phone.app.racing')(set => ({
  hidden: true,
  tracks: [],
  racingAlias: undefined,
  canCreateTrack: false,
  selectedRace: undefined,
  setTracks: t => set(() => ({ tracks: t })),
  setRacingAlias: (alias: string | undefined) => set(() => ({ racingAlias: alias })),
}));

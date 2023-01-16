import { defaultState } from '../defaultState';
import { isDevel } from '../env';
import { create } from '../store';

export const useMainStore = create<Main.State & Main.StateActions>('main')(set => ({
  currentApp: '',
  apps: [],
  error: null,
  mounted: true,
  character: isDevel()
    ? defaultState.character
    : {
        cash: 0,
        cid: 0,
        firstname: 'John',
        hasPhone: false,
        hasVPN: false,
        isAdmin: false,
        job: '',
        lastname: 'Doe',
        phone: '0',
        server_id: 0,
      },
  game: {
    location: 'world',
    time: '12:00',
    weather: 'EXTRASUNNY',
  },
  jobs: [],
  setCurrentApp: app => set(() => ({ currentApp: app })),
  setApps: apps => set(() => ({ apps })),
  setError: err => set(() => ({ error: err, mounted: false })),
  removeError: () => set(() => ({ error: null })),
  setCharacter: char => set(() => ({ character: char })),
  setTime: time => set(s => ({ game: { ...s.game, time } })),
  setWeather: weather => set(s => ({ game: { ...s.game, weather } })),
}));

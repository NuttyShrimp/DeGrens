import { create } from '@src/lib/store';

const initialStore: Gridgame.State = {
  active: null,
  id: '',
  gridSize: 0,
  data: null,
  cells: [],
};

export const useGridGameStore = create<Gridgame.State & Gridgame.StateActions>('gridgame')(set => ({
  ...initialStore,
  startGame: (id, active, size, data) => set(() => ({ active, id, gridSize: size, data })),
  resetGame: () => set(() => ({ ...initialStore })),
  setCells: c => set(() => ({ cells: c })),
}));

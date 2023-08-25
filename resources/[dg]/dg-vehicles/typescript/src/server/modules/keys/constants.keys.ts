export const NO_LOCK_CLASSES: Record<Vehicles.LockpickType, number[]> = {
  door: [13, 14], //  bikes & boats
  hotwire: [13], // bikes,
  hack: [13, 14], // bikes & boats
};

export const CLASS_TO_LOCKPICK_DIFFICULTY: Record<
  Vehicles.Class,
  {
    lockpick: { speed: number; size: number };
    hack: { gridSize: number; time: number };
  }
> = {
  D: {
    lockpick: { speed: 3, size: 40 },
    hack: { gridSize: 4, time: 40 },
  },
  C: {
    lockpick: { speed: 5, size: 30 },
    hack: { gridSize: 4, time: 30 },
  },
  B: {
    lockpick: { speed: 7, size: 20 },
    hack: { gridSize: 4, time: 25 },
  },
  A: {
    lockpick: { speed: 10, size: 15 },
    hack: { gridSize: 6, time: 120 },
  },
  'A+': {
    lockpick: { speed: 13, size: 10 },
    hack: { gridSize: 6, time: 100 },
  },
  S: {
    lockpick: { speed: 17, size: 8 },
    hack: { gridSize: 6, time: 80 },
  },
  X: {
    lockpick: { speed: 20, size: 7 },
    hack: { gridSize: 8, time: 240 },
  },
};

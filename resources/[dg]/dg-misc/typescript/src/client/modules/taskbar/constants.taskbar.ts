export const disabledControlMap: Record<string, number[]> = {
  mouse: [1, 2, 106],
  movement: [30, 31, 36, 21],
  carMovement: [63, 64, 71, 72, 75],
  combat: [24, 25, 37, 47, 58, 140, 141, 142, 143, 263, 264, 257],
};

export enum TaskbarState {
  Idle,
  Running,
  Canceled,
  Completed,
}

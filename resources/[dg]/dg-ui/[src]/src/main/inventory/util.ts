import { XYCoord } from 'react-dnd';

export const coordToPx = (coord: XYCoord, cellSize: number): XYCoord => {
  return { x: coord.x * cellSize, y: coord.y * cellSize };
};

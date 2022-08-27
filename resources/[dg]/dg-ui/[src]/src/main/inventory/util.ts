import { XYCoord } from 'react-dnd';

const images = import.meta.glob('../../assets/inventory/*.png', { eager: true });

export const coordToPx = (coord: XYCoord, cellSize: number): XYCoord => {
  return { x: coord.x * cellSize, y: coord.y * cellSize };
};

export const getImg = (name: string) => {
  if (!name) name = 'noicon.png';
  const path = `../../assets/inventory/${name}`;
  return (images[path] as any)?.default ?? getImg('noicon.png');
};

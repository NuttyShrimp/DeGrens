import { XYCoord } from 'react-dnd';

const images = import.meta.globEager('../../assets/inventory/*.png');

export const coordToPx = (coord: XYCoord, cellSize: number): XYCoord => {
  return { x: coord.x * cellSize, y: coord.y * cellSize };
};

export const getImg = (name: string) => {
  if (!name) name = 'noicon.png';
  const path = `../../assets/inventory/${name}`;
  const img = images[path]?.default ?? getImg('noicon.png');
  return img;
};

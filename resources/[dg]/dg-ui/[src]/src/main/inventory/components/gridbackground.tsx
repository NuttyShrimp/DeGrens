import { FC } from 'react';

export const GridBackground: FC<{ gridSize: Inventory.XY; cellSize: number }> = ({ gridSize, cellSize }) => {
  return (
    <div className='background'>
      {[...Array(gridSize.x * gridSize.y)].map((_, key) => {
        return (
          <div
            key={key}
            style={{
              width: cellSize,
            }}
          />
        );
      })}
    </div>
  );
};

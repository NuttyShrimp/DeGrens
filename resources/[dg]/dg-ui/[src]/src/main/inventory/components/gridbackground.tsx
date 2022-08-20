import React, { FC } from 'react';
import { XYCoord } from 'react-dnd';

export const GridBackground: FC<{ gridSize: XYCoord; cellSize: number }> = ({ gridSize, cellSize }) => {
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

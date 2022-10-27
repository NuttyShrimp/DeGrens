import React, { FC } from 'react';

import { useGrid } from '../hooks/usegrid';

import { Gridcell } from './gridcell';

const getGridStyle = (size: number) => {
  const str = `repeat(${size}, 10vh)`;
  return { gridTemplateColumns: str, gridTemplateRows: str };
};

export const Grid: FC<{ onClick: Gridgame.ClickHandler }> = props => {
  const { gridSize, cells } = useGrid();

  return (
    <div className='box gridgame-grid' style={getGridStyle(gridSize)}>
      {cells.map(cell => (
        <Gridcell key={`gridgame-cell-${cell.id}`} {...cell} onClick={props.onClick} />
      ))}
    </div>
  );
};

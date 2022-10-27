import React, { FC } from 'react';
import { baseStyle } from '@src/base.styles';

export const Gridcell: FC<Gridgame.Cell & { onClick: Gridgame.ClickHandler }> = props => {
  const handleClick = () => {
    const { onClick, ...cell } = props;
    onClick(cell);
  };

  const getColor = () => {
    if (props.color) return props.color;
    if (props.active) return baseStyle.primary.normal;
    return baseStyle.primary.darker;
  };

  return (
    <div className='cell' onClick={handleClick}>
      <div className='box' style={{ backgroundColor: getColor() }}>
        <p>{props.displayLabel && props.label}</p>
      </div>
    </div>
  );
};

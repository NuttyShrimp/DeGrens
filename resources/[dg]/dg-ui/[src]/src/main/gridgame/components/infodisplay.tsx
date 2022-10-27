import React, { FC } from 'react';

export const InfoDisplay: FC<Gridgame.InfoDisplay & { size: number }> = props => {
  return (
    <div className='box gridgame-infodisplay' style={{ width: `${props.size}vh` }}>
      <div className='box' style={{ backgroundColor: props.color }}>
        <p>{props.text}</p>
      </div>
    </div>
  );
};

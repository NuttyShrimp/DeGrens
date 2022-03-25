import React from 'react';

export const Compass: React.FC<Hud.Compass> = props => {
  if (!props.visible) return null;
  return (
    <div>
      <p>Nice compass bwo</p>
    </div>
  );
};

import React, { FC } from 'react';
import { getImg } from '@src/lib/util';

export const ItemImage: FC<{ width: number; height: number; itemState: Inventory.Item }> = ({
  width,
  height,
  itemState,
}) => {
  return (
    <div className='image'>
      <img
        src={getImg(itemState.image)}
        onError={() => console.log(`No image found with filename '${itemState.image}'`)}
        style={itemState.rotated ? { transform: `rotate(90deg)`, width: height, height: width } : { width, height }}
      />
    </div>
  );
};

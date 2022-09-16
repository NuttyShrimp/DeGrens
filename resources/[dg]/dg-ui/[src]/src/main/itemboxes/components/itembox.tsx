import React, { FC } from 'react';

import { getImg } from '../../../lib/util';

export const Itembox: FC<Itemboxes.Itembox> = props => {
  return (
    <div className='itembox'>
      <p>{props.action}</p>
      {
        <div className='image'>
          <img src={getImg(props.image)} onError={() => console.log(`No image found with filename '${props.image}'`)} />
        </div>
      }
    </div>
  );
};

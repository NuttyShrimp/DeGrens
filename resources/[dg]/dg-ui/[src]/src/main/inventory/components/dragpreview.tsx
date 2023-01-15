import React from 'react';
import { FC } from 'react';
import { usePreview } from 'react-dnd-preview';
import { usePreviewStateFull } from 'react-dnd-preview/dist/usePreview';
import { alpha } from '@mui/material';
import { baseStyle } from '@src/base.styles';

import { getImg } from '../../../lib/util';
import { coordToPx } from '../util';

export const DragPreview: FC<{ cellSize: number }> = ({ cellSize }) => {
  const { display, item, style } = usePreview<Inventory.DragItem, HTMLDivElement>() as usePreviewStateFull<
    Inventory.DragItem,
    HTMLDivElement
  >;

  return (
    <>
      {display && (
        <div
          className='inventory__item'
          style={{
            ...style,
            width: coordToPx(item.size, cellSize).x,
            height: coordToPx(item.size, cellSize).y,
            backgroundColor: alpha(item.quality > 10 ? baseStyle.primary.normal : baseStyle.tertiary.normal, 0.5),
            borderColor: alpha(item.quality > 10 ? baseStyle.primaryDarker.dark : baseStyle.tertiary.dark, 0.9),
          }}
        >
          {
            <div className='image'>
              <img
                src={getImg(item.image)}
                onError={() => console.log(`No image found with filename '${item.image}'`)}
              />
            </div>
          }
          {item.size.x != 1 && <p className='label text'>{item.label}</p>}
          {item.hotkey && (
            <div className='hotkey'>
              <div />
              <p>{item.hotkey}</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

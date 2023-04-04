import React, { FC, useMemo } from 'react';
import { usePreview } from 'react-dnd-preview';
import { usePreviewStateFull } from 'react-dnd-preview/dist/usePreview';
import { alpha } from '@mui/material';
import { baseStyle } from '@src/base.styles';

import { useInventoryStore } from '../stores/useInventoryStore';
import { coordToPx } from '../util';

import { ItemImage } from './itemimage';

export const DragPreview: FC<{ cellSize: number }> = ({ cellSize }) => {
  const { display, item, style } = usePreview<{ id: string }, HTMLDivElement>() as usePreviewStateFull<
    { id: string },
    HTMLDivElement
  >;
  const itemState = useInventoryStore(s => (item?.id ? s.items[item.id] : null));

  const colors = useMemo(() => {
    let background = baseStyle.primary.normal;
    let border = baseStyle.primaryDarker.dark;

    if (itemState?.quality && itemState.quality <= 25) {
      background = baseStyle.tertiary.normal;
      border = baseStyle.tertiary.dark;
    }

    return { background, border };
  }, [itemState?.quality]);

  if (!itemState) return null;

  const itemWidth = coordToPx(itemState.size, cellSize)[itemState.rotated ? 'y' : 'x'];
  const itemHeight = coordToPx(itemState.size, cellSize)[itemState.rotated ? 'x' : 'y'];

  return (
    <>
      {display && (
        <div
          className='inventory__item'
          style={{
            ...style,
            width: itemWidth,
            height: itemHeight,
            backgroundColor: alpha(colors.background, 0.4),
            borderColor: alpha(colors.border, 0.9),
          }}
        >
          <ItemImage width={itemWidth} height={itemHeight} itemState={itemState} />
          {itemState.size[itemState.rotated ? 'y' : 'x'] != 1 && <p className='label text'>{itemState.label}</p>}
          {itemState.hotkey && (
            <div className='hotkey'>
              <div />
              <p>{itemState.hotkey}</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

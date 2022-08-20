import React, { FC, useCallback, useEffect, useState } from 'react';
import { useDrag } from 'react-dnd';
import { useSelector } from 'react-redux';
import { alpha, Tooltip } from '@mui/material';
import { baseStyle } from '@src/base.styles';
import { closeApplication } from '@src/components/appwrapper';
import { nuiAction } from '@src/lib/nui-comms';
import { useNotifications } from '@src/main/notifications/hooks/useNotification';

import {
  bindItemToKey,
  getFirstFreeSpace,
  getOtherInventoryId,
  isItemAllowedInInventory,
  isUseable,
  unbindItem,
  updateItemPosition,
} from '../lib';
import store from '../store';
import { coordToPx, getImg } from '../util';

import { ItemTooltip } from './itemtooltip';

export const Item: FC<{ itemId: string; cellSize: number }> = ({ itemId, cellSize }) => {
  const [isHovering, setIsHovering] = useState(false);
  const itemState = useSelector<RootState, Inventory.Item>(state => state.inventory.items[itemId]);
  const { addNotification } = useNotifications();

  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: 'ITEM',
      item: {
        id: itemState.id,
        name: itemState.name,
        size: itemState.size,
        quality: itemState.quality,
        image: itemState.image,
        label: itemState.label,
        hotkey: itemState.hotkey,
        requirements: itemState.requirements,
      },
      collect: monitor => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [itemState.hotkey]
  );

  const handleDoubleClick = e => {
    e.preventDefault();

    if (!isUseable(itemState)) return addNotification({ message: 'Je kan dit niet gebruiken.', type: 'error' });
    nuiAction('inventory/useItem', { id: itemState.id });

    if (itemState.closeOnUse ?? true) {
      closeApplication(store.key);
    } else {
      addNotification({ message: `Je hebt ${itemState.label} gebruikt`, type: 'success' });
    }
  };

  const handleRightClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();

    const targetInventoryId = getOtherInventoryId(itemState.inventory);
    if (!isItemAllowedInInventory(itemState.name, targetInventoryId))
      return addNotification({ message: 'Dit kan hier niet in', type: 'error' });

    const newPosition = getFirstFreeSpace(itemState.id, targetInventoryId);
    if (!newPosition) return addNotification({ message: 'Dit past hier niet meer in', type: 'error' });
    updateItemPosition(itemState.id, targetInventoryId, newPosition);
  };

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== '1' && e.key !== '2' && e.key !== '3' && e.key !== '4' && e.key !== '5') return;
      if (e.repeat) return;

      const key = Number(e.key);
      if (itemState.hotkey === key) {
        unbindItem(itemState.id);
        return;
      }
      const alert = bindItemToKey(itemState.id, key);
      addNotification(alert);
    },
    [itemState.id]
  );

  useEffect(() => {
    if (isHovering) window.addEventListener('keydown', handleKeyPress);
    else window.removeEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isHovering]);

  return (
    <Tooltip
      classes={{ tooltip: 'inventory__tooltip' }}
      title={<ItemTooltip {...itemState} />}
      placement='right-start'
      enterDelay={500}
      disableInteractive
      followCursor
    >
      <div
        className='inventory__item'
        ref={dragRef}
        style={{
          left: coordToPx(itemState.position, cellSize).x,
          top: coordToPx(itemState.position, cellSize).y,
          width: coordToPx(itemState.size, cellSize).x,
          height: coordToPx(itemState.size, cellSize).y,
          backgroundColor: alpha(itemState.quality > 10 ? baseStyle.primary.normal : baseStyle.tertiary.normal, 0.5),
          borderColor: alpha(itemState.quality > 10 ? baseStyle.primaryDarker.dark : baseStyle.tertiary.dark, 0.9),
          display: isDragging ? 'none' : 'initial',
        }}
        onContextMenu={handleRightClick}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {
          <div className='image'>
            <img
              src={getImg(itemState.image)}
              onError={() => console.log(`No image found with filename '${itemState.image}'`)}
            />
          </div>
        }
        {itemState.size.x != 1 && <p className='label text'>{itemState.label}</p>}
        {itemState.hotkey && (
          <div className='hotkey'>
            <div />
            <p>{itemState.hotkey}</p>
          </div>
        )}
      </div>
    </Tooltip>
  );
};

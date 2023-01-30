import React, { FC, useEffect, useState } from 'react';
import { useDrag } from 'react-dnd';
import { alpha, Tooltip } from '@mui/material';
import { baseStyle } from '@src/base.styles';
import { closeApplication } from '@src/components/appwrapper';
import { nuiAction } from '@src/lib/nui-comms';
import { useNotifications } from '@src/main/notifications/hooks/useNotification';

import config from '../_config';
import { useInventory } from '../hooks/useInventory';
import { useInventoryStore } from '../stores/useInventoryStore';
import { coordToPx } from '../util';

import { ItemImage } from './itemimage';
import { ItemTooltip } from './itemtooltip';

export const Item: FC<{ itemId: string; cellSize: number }> = ({ itemId, cellSize }) => {
  const [isHovering, setIsHovering] = useState(false);
  const itemState = useInventoryStore(s => s.items[itemId]);
  const { addNotification } = useNotifications();
  const [hotkeyPressed, setHotkeyPressed] = useState<number | null>(null);
  const {
    bindItemToKey,
    getFirstFreeSpace,
    getOtherInventoryId,
    isItemAllowedInInventory,
    isUseable,
    unbindItem,
    updateItemPosition,
    toggleItemRotation,
  } = useInventory();

  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: 'ITEM',
      item: {
        id: itemState.id,
        originalRotated: itemState.rotated, // We pass this to check if rotation was changed while dragging because this will be state before drag start
      },
      collect: monitor => ({
        isDragging: monitor.isDragging(),
      }),
      canDrag: () => {
        if (itemState.amount === undefined) return true;
        return itemState.amount > 0;
      },
    }),
    [itemState.amount, itemState.rotated]
  );

  const handleDoubleClick = e => {
    e.preventDefault();

    if (!isUseable(itemState)) return addNotification({ message: 'Je kan dit niet gebruiken.', type: 'error' });
    nuiAction('inventory/useItem', { id: itemState.id });

    if (itemState.closeOnUse ?? true) {
      closeApplication(config.name);
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

  useEffect(() => {
    if (!isHovering) return;
    const handler = (e: KeyboardEvent) => {
      // fucking scuffed ass way lmao
      if (![...new Array(5)].some((_, i) => `Digit${i + 1}` === e.code)) return;
      if (e.repeat) return;

      const key = Number(e.code.replace('Digit', ''));
      setHotkeyPressed(key);
    };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [isHovering]);

  useEffect(() => {
    if (hotkeyPressed === null) return;
    setHotkeyPressed(null);
    if (itemState.hotkey === hotkeyPressed) {
      unbindItem(itemState.id);
      return;
    }
    const alert = bindItemToKey(itemState.id, hotkeyPressed);
    addNotification(alert);
  }, [hotkeyPressed]);

  useEffect(() => {
    if (!isDragging) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'r') return;
      toggleItemRotation(itemState.id);
    };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [isDragging]);

  const itemWidth = coordToPx(itemState.size, cellSize)[itemState.rotated ? 'y' : 'x'];
  const itemHeight = coordToPx(itemState.size, cellSize)[itemState.rotated ? 'x' : 'y'];

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
          width: itemWidth,
          height: itemHeight,
          backgroundColor: alpha(itemState.quality > 10 ? baseStyle.primary.normal : baseStyle.tertiary.normal, 0.4),
          borderColor: alpha(itemState.quality > 10 ? baseStyle.primaryDarker.dark : baseStyle.tertiary.dark, 0.9),
          display: isDragging ? 'none' : 'initial',
        }}
        onContextMenu={handleRightClick}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
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
    </Tooltip>
  );
};

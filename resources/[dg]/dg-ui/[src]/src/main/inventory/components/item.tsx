import React, { FC, useEffect, useMemo, useState } from 'react';
import { useDrag } from 'react-dnd';
import { alpha, Tooltip } from '@mui/material';
import { baseStyle } from '@src/base.styles';

import { useInventory } from '../hooks/useInventory';
import { useInventoryStore } from '../stores/useInventoryStore';
import { coordToPx } from '../util';

import { ItemImage } from './itemimage';
import { ItemTooltip } from './itemtooltip';

export const Item: FC<{ itemId: string; cellSize: number }> = ({ itemId, cellSize }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [itemState, currentSelectorInventory, updateInventoryStore, holdingSelector, selectedItems] = useInventoryStore(
    s => [s.items[itemId], s.currentSelectorInventory, s.updateStore, s.holdingSelector, s.selectedItems]
  );
  const [hotkeyPressed, setHotkeyPressed] = useState<number | null>(null);
  const { bindItemToKey, doItemUsage, unbindItem, toggleItemRotation, switchItemsToOtherInventory } = useInventory();

  const isSelected = useMemo(() => {
    return selectedItems.indexOf(itemId) !== -1;
  }, [selectedItems]);

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
        if (holdingSelector) return false;
        if (itemState.amount === undefined) return true;
        return itemState.amount > 0;
      },
    }),
    [itemState.amount, itemState.rotated, holdingSelector]
  );

  const handleDoubleClick = e => {
    e.preventDefault();

    if (holdingSelector) return;
    doItemUsage(itemState.id);
  };

  const handleRightClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();

    let itemIds: string | string[] = itemState.id;
    if (selectedItems.length !== 0) {
      updateInventoryStore({ selectedItems: [] });
      itemIds = [...selectedItems];
    }

    switchItemsToOtherInventory(itemIds);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);

    if (itemState.amount === undefined && itemState.inventory === currentSelectorInventory && !isSelected) {
      updateInventoryStore(s => ({ selectedItems: [...s.selectedItems, itemState.id] }));
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  // Handle keybind pressing
  useEffect(() => {
    if (!isHovering || holdingSelector) return;

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

  // Handle binding when key was pressed
  useEffect(() => {
    if (hotkeyPressed === null) return;
    setHotkeyPressed(null);
    if (itemState.hotkey === hotkeyPressed) {
      unbindItem(itemState.id);
      return;
    }
    bindItemToKey(itemState.id, hotkeyPressed);
  }, [hotkeyPressed]);

  // When started dragging, remove item from selectedItems & handle rotating events
  useEffect(() => {
    if (!isDragging) return;

    updateInventoryStore(s => ({
      currentSelectorInventory: null,
      selectedItems: s.selectedItems.filter(id => id !== itemState.id),
    }));

    const handler = (e: KeyboardEvent) => {
      if (e.code !== 'KeyR') return;
      toggleItemRotation(itemState.id);
    };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [isDragging]);

  const itemWidth = coordToPx(itemState.size, cellSize)[itemState.rotated ? 'y' : 'x'];
  const itemHeight = coordToPx(itemState.size, cellSize)[itemState.rotated ? 'x' : 'y'];

  const colors = useMemo(() => {
    let background = baseStyle.primary.normal;
    let border = baseStyle.primaryDarker.dark;

    if (itemState.quality && itemState.quality <= 25) {
      background = baseStyle.tertiary.normal;
      border = baseStyle.tertiary.dark;
    }

    if (isSelected) {
      background = baseStyle.secondary.normal;
      border = baseStyle.secondary.dark;
    }

    return { background, border };
  }, [itemState.quality, isSelected]);

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
          backgroundColor: alpha(colors.background, 0.4),
          borderColor: alpha(colors.border, 0.9),
          display: isDragging ? 'none' : 'initial',
        }}
        onContextMenu={handleRightClick}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
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

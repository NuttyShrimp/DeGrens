import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useDrop } from 'react-dnd';
import { useNotifications } from '@src/main/notifications/hooks/useNotification';

import { CELLS_PER_ROW } from '../constants';
import { useInventory } from '../hooks/useInventory';
import { useInventoryStore } from '../stores/useInventoryStore';

import { GridBackground } from './gridbackground';
import { Item } from './item';

export const Grid: FC<{ id: string; size: number; items: string[]; cellSize: number }> = props => {
  const gridRef = useRef<HTMLDivElement>(null);
  const { addNotification } = useNotifications();
  const {
    areRequirementsFullfilled,
    canPlaceItemAtPosition,
    isItemAllowedInInventory,
    updateItemPosition,
    toggleItemRotation,
  } = useInventory();
  const [items, holdingSelector, updateInventoryStore, shopOpen] = useInventoryStore(s => [
    s.items,
    s.holdingSelector,
    s.updateStore,
    s.shopOpen,
  ]);
  const [hovering, setHovering] = useState(false);

  const [, dropRef] = useDrop(
    () => ({
      accept: 'ITEM',
      drop({ id, originalRotated }: { id: string; originalRotated: boolean }, monitor) {
        const itemState = items[id];

        if (!isItemAllowedInInventory(itemState.name, props.id)) {
          addNotification({ message: 'Dit kan hier niet in', type: 'error' });
          if (itemState.rotated !== originalRotated) {
            toggleItemRotation(id, originalRotated);
          }
          return;
        }

        if (!areRequirementsFullfilled(itemState.requirements)) {
          addNotification({ message: 'Je mist iets', type: 'error' });
          if (itemState.rotated !== originalRotated) {
            toggleItemRotation(id, originalRotated);
          }
          return;
        }

        if (itemState.amount !== undefined && itemState.amount <= 0) {
          addNotification({ message: 'Dit item is out of stock', type: 'error' });
          if (itemState.rotated !== originalRotated) {
            toggleItemRotation(id, originalRotated);
          }
          return;
        }

        if (!gridRef.current) {
          if (itemState.rotated !== originalRotated) {
            toggleItemRotation(id, originalRotated);
          }
          return;
        }

        const gridPosition = gridRef.current.getBoundingClientRect();
        const dropPosition = monitor.getSourceClientOffset();
        if (!dropPosition) {
          if (itemState.rotated !== originalRotated) {
            toggleItemRotation(id, originalRotated);
          }
          return;
        }

        const newPosition = {
          x: Math.round((dropPosition.x - gridPosition.x) / props.cellSize),
          y: Math.round((dropPosition.y - gridPosition.y + gridRef.current.scrollTop) / props.cellSize),
        };

        if (!canPlaceItemAtPosition(id, props.id, newPosition)) {
          if (itemState.rotated !== originalRotated) {
            toggleItemRotation(id, originalRotated);
          }
          return;
        }

        updateItemPosition(id, props.id, originalRotated, newPosition, itemState.rotated);
      },
    }),
    [
      items,
      gridRef.current,
      props.id,
      props.cellSize,
      updateItemPosition,
      isItemAllowedInInventory,
      areRequirementsFullfilled,
      canPlaceItemAtPosition,
    ]
  );
  dropRef(gridRef);

  const background = useMemo(
    () => <GridBackground gridSize={{ x: CELLS_PER_ROW, y: props.size ?? 0 }} cellSize={props.cellSize} />,
    [props.cellSize, props.size]
  );

  const handleMouseEnter = () => {
    setHovering(true);
  };

  const handleMouseLeave = () => {
    setHovering(false);
    // reset selector things when leaving grid
    updateInventoryStore({
      currentSelectorInventory: null,
      selectedItems: [],
    });
  };

  // When holding selector key and hovering grid, set as current selector inventory
  // disallow selector when shop is open
  useEffect(() => {
    if (!holdingSelector || !hovering || shopOpen) return;

    updateInventoryStore({
      currentSelectorInventory: props.id,
      selectedItems: [],
    });
  }, [hovering, holdingSelector]);

  return (
    <div ref={gridRef} className='grid' tabIndex={-1} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {background}
      {props.items.map(id => (
        <Item itemId={id} cellSize={props.cellSize} key={id} />
      ))}
    </div>
  );
};

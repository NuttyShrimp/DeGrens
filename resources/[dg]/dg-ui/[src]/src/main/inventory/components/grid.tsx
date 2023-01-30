import React, { FC, useMemo, useRef } from 'react';
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
  const items = useInventoryStore(s => s.items);

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

        updateItemPosition(id, props.id, newPosition);
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

  return (
    <div ref={gridRef} className='grid' tabIndex={-1}>
      {background}
      {props.items.map(id => (
        <Item itemId={id} cellSize={props.cellSize} key={id} />
      ))}
    </div>
  );
};

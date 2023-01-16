import React, { FC, useMemo, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { useNotifications } from '@src/main/notifications/hooks/useNotification';

import { CELLS_PER_ROW } from '../constants';
import { useInventory } from '../hooks/useInventory';

import { GridBackground } from './gridbackground';
import { Item } from './item';

export const Grid: FC<{ id: string; size: number; items: string[]; cellSize: number }> = props => {
  const gridRef = useRef<HTMLDivElement>(null);
  const { addNotification } = useNotifications();
  const { areRequirementsFullfilled, canPlaceItemAtPosition, isItemAllowedInInventory, updateItemPosition } =
    useInventory();

  const [, dropRef] = useDrop(
    () => ({
      accept: 'ITEM',
      drop({ id, name, requirements }: Pick<Inventory.Item, 'id' | 'name' | 'requirements'>, monitor) {
        if (!isItemAllowedInInventory(name, props.id))
          return addNotification({ message: 'Dit kan hier niet in', type: 'error' });

        if (!areRequirementsFullfilled(requirements))
          return addNotification({ message: 'Je mist iets', type: 'error' });

        if (!gridRef.current) return;
        const gridPosition = gridRef.current.getBoundingClientRect();
        const dropPosition = monitor.getSourceClientOffset();
        if (!dropPosition) return;

        const newPosition = {
          x: Math.round((dropPosition.x - gridPosition.x) / props.cellSize),
          y: Math.round((dropPosition.y - gridPosition.y + gridRef.current.scrollTop) / props.cellSize),
        };
        if (!canPlaceItemAtPosition(id, props.id, newPosition)) return;
        updateItemPosition(id, props.id, newPosition);
        return;
      },
    }),
    [
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

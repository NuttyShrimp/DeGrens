import React, { FC, useCallback, useEffect, useState } from 'react';
import { useDragDropManager } from 'react-dnd';
import { useVhToPixel } from '@src/lib/hooks/useVhToPixel';
import { useVisibleStore } from '@src/lib/stores/useVisibleStore';

import { useInventoryStore } from '../stores/useInventoryStore';

import { DragPreview } from './dragpreview';
import { PrimarySide, SecondarySide } from './sides';

export const Inventory: FC<{ refreshDrag: number }> = props => {
  const dndManager = useDragDropManager();
  const cellVhToPixel = useVhToPixel(6);
  const [cellSize, setCellSize] = useState(64);
  const visible = useVisibleStore(s => s.visibleApps.includes('inventory'));
  const [inventories, items, primaryId, secondaryId] = useInventoryStore(s => [
    s.inventories,
    s.items,
    s.primaryId,
    s.secondaryId,
  ]);

  const cancelDrag = useCallback(() => {
    dndManager.dispatch({ type: 'dnd-core/END_DRAG' });
  }, [dndManager]);

  useEffect(() => {
    setCellSize(Math.floor(cellVhToPixel));
  }, [cellVhToPixel]);

  useEffect(() => {
    if (visible) return;
    cancelDrag();
  }, [visible]);

  useEffect(() => {
    cancelDrag();
  }, [props.refreshDrag]);

  return (
    <>
      <div className='inventory__wrapper' tabIndex={-1}>
        <PrimarySide
          {...(inventories[primaryId] as Inventory.PrimarySide)}
          items={Object.values(items)
            .filter(i => i.inventory === primaryId)
            .map(i => i.id)}
          cellSize={cellSize}
        />
        <SecondarySide
          {...(inventories[secondaryId] as Inventory.SecondarySide)}
          items={Object.values(items)
            .filter(i => i.inventory === secondaryId)
            .map(i => i.id)}
          cellSize={cellSize}
        />
      </div>
      <DragPreview cellSize={cellSize} />
    </>
  );
};

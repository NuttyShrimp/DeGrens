import React, { FC, useCallback, useEffect, useState } from 'react';
import { useDragDropManager } from 'react-dnd';
import { useVhToPixel } from '@src/lib/hooks/useVhToPixel';
import { useVisibleStore } from '@src/lib/stores/useVisibleStore';

import { useInventoryStore } from '../stores/useInventoryStore';

import { DragPreview } from './dragpreview';
import { HelpTooltip } from './helptooltip';
import { PrimarySide, SecondarySide } from './sides';

export const Inventory: FC = () => {
  const dndManager = useDragDropManager();
  const cellVhToPixel = useVhToPixel(6);
  const [cellSize, setCellSize] = useState(64);
  const visible = useVisibleStore(s => s.visibleApps.includes('inventory'));
  const [inventories, items, primaryId, secondaryId, updateInventoryStore, syncedItemIds] = useInventoryStore(s => [
    s.inventories,
    s.items,
    s.primaryId,
    s.secondaryId,
    s.updateStore,
    s.syncedItemIds,
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
    if (syncedItemIds.length === 0) return;

    const currentDraggingItem: string = dndManager.getMonitor().getItem()?.id;
    if (!currentDraggingItem) return;
    if (syncedItemIds.indexOf(currentDraggingItem) === -1) return;

    cancelDrag();
  }, [syncedItemIds]);

  useEffect(() => {
    // keydown event keeps firing while holding, we make it a toggle
    let selectorPressed = false;

    const downHandler = (e: KeyboardEvent) => {
      if (e.code !== 'ControlLeft' || selectorPressed) return;
      updateInventoryStore({
        holdingSelector: true,
      });
      selectorPressed = true;
    };
    const upHandler = (e: KeyboardEvent) => {
      if (e.code !== 'ControlLeft') return;
      // reset all selector things when releasing button
      updateInventoryStore({
        holdingSelector: false,
        currentSelectorInventory: null,
        selectedItems: [],
      });
      selectorPressed = false;
    };
    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);
    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, []);

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
        <div className='help'>
          <HelpTooltip />
        </div>
      </div>
      <DragPreview cellSize={cellSize} />
    </>
  );
};

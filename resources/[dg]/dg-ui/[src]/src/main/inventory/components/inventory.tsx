import React, { useCallback, useEffect, useState } from 'react';
import { useDragDropManager } from 'react-dnd';
import { useVhToPixel } from '@src/lib/hooks/useVhToPixel';

import { DragPreview } from './dragpreview';
import { PrimarySide, SecondarySide } from './sides';

export const Inventory: AppFunction<Inventory.State & { refreshDrag: number }> = props => {
  const dndManager = useDragDropManager();
  const cellVhToPixel = useVhToPixel(6);
  const [cellSize, setCellSize] = useState(64);

  const cancelDrag = useCallback(() => {
    dndManager.dispatch({ type: 'dnd-core/END_DRAG' });
  }, [dndManager]);

  useEffect(() => {
    setCellSize(Math.floor(cellVhToPixel));
  }, [cellVhToPixel]);

  useEffect(() => {
    if (props.visible) return;
    cancelDrag();
  }, [props.visible]);

  useEffect(() => {
    cancelDrag();
  }, [props.refreshDrag]);

  return (
    <>
      <div className='inventory__wrapper' tabIndex={-1}>
        <PrimarySide
          {...(props.inventories[props.primaryId] as Inventory.PrimarySide)}
          items={Object.values(props.items)
            .filter(i => i.inventory === props.primaryId)
            .map(i => i.id)}
          cellSize={cellSize}
        />
        <SecondarySide
          {...(props.inventories[props.secondaryId] as Inventory.SecondarySide)}
          items={Object.values(props.items)
            .filter(i => i.inventory === props.secondaryId)
            .map(i => i.id)}
          cellSize={cellSize}
        />
      </div>
      <DragPreview cellSize={cellSize} />
    </>
  );
};

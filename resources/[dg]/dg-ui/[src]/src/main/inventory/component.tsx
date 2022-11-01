import React, { useCallback, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import AppWrapper from '@components/appwrapper';
import { devData } from '@src/lib/devdata';
import { nuiAction } from '@src/lib/nui-comms';

import { useApps } from '../../lib/hooks/useApps';

import { Inventory } from './components/inventory';
import { syncItem } from './lib';
import store from './store';

import './styles/inventory.scss';

const Component: AppFunction<Inventory.State> = props => {
  const { getCurrentAppType } = useApps();
  // useDragDropContext can only be used in childcomponents of DndProvidor.
  // we need to refresh the childcomp when we want to cancel dragdrop from itemsync event
  const [refreshDrag, setRefreshDrag] = useState(0);

  const handleShow = useCallback(() => {
    props.updateState({
      visible: true,
    });
    fetchInventoryData();
  }, [getCurrentAppType]);

  const handleHide = useCallback(() => props.updateState(store.initialState), []);

  const updateItem = useCallback(
    (item: Inventory.Item) => {
      if (!props.visible) return;
      setRefreshDrag(refreshDrag + 1);
      syncItem(item);
    },
    [props.visible, syncItem]
  );

  const fetchInventoryData = async () => {
    const activeData: Inventory.OpeningData = await nuiAction('inventory/getData', {}, devData.inventory);
    props.updateState({
      items: activeData.items,
      inventories: {
        [activeData.primary.id]: activeData.primary,
        [activeData.secondary.id]: activeData.secondary,
      },
      primaryId: activeData.primary.id,
      secondaryId: activeData.secondary.id,
    });
  };

  return (
    <AppWrapper
      appName={store.key}
      onShow={handleShow}
      onHide={handleHide}
      hideOnEscape
      onEvent={updateItem}
      full
      center
    >
      <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
        <Inventory {...props} refreshDrag={refreshDrag} />
      </DndProvider>
    </AppWrapper>
  );
};

export default Component;

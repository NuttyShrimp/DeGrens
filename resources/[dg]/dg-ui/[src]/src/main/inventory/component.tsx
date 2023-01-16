import React, { useCallback, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import AppWrapper from '@components/appwrapper';
import { devData } from '@src/lib/devdata';
import { nuiAction } from '@src/lib/nui-comms';
import { useVisibleStore } from '@src/lib/stores/useVisibleStore';

import { Inventory } from './components/inventory';
import { useInventory } from './hooks/useInventory';
import { useInventoryStore } from './stores/useInventoryStore';
import config from './_config';
import { generateShopItems } from './util';

import './styles/inventory.scss';

const Component: AppFunction = props => {
  // useDragDropContext can only be used in childcomponents of DndProvidor.
  // we need to refresh the childcomp when we want to cancel dragdrop from itemsync event
  const [refreshDrag, setRefreshDrag] = useState(0);
  const [updateStore, resetStore] = useInventoryStore(s => [s.updateStore, s.resetStore]);
  const visible = useVisibleStore(s => s.visibleApps.includes(config.name));
  const { syncItem } = useInventory();

  const handleShow = useCallback(() => {
    props.showApp();
    fetchInventoryData();
  }, [props.showApp]);

  const handleHide = useCallback(() => {
    props.hideApp();
    resetStore();
  }, [props.hideApp, resetStore]);

  const updateItem = useCallback(
    (item: Inventory.Item) => {
      if (!visible) return;
      setRefreshDrag(refreshDrag + 1);
      syncItem(item);
    },
    [visible]
  );

  const fetchInventoryData = async () => {
    const activeData: Inventory.OpeningData = await nuiAction('inventory/getData', {}, devData.inventory);

    // Autofill secondary if its a shop
    let items = activeData.items;
    let secondaryData: Inventory.SecondarySide;
    if ('shopItems' in activeData.secondary) {
      const generatedItems = generateShopItems(activeData.secondary.id, activeData.secondary.shopItems);
      secondaryData = { id: activeData.secondary.id, size: generatedItems.size, allowedItems: [] };
      items = { ...items, ...generatedItems.items };
    } else {
      secondaryData = activeData.secondary;
    }

    updateStore({
      items: items,
      inventories: {
        [activeData.primary.id]: activeData.primary,
        [activeData.secondary.id]: secondaryData,
      },
      primaryId: activeData.primary.id,
      secondaryId: activeData.secondary.id,
    });
  };

  return (
    <AppWrapper
      appName={config.name}
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

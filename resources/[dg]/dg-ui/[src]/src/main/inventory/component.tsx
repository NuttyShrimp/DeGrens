import React, { useCallback } from 'react';
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
  const [updateStore, resetStore] = useInventoryStore(s => [s.updateStore, s.resetStore]);
  const visible = useVisibleStore(s => s.visibleApps.includes(config.name));
  const { syncItems } = useInventory();

  const handleShow = () => {
    props.showApp();
    fetchInventoryData();
  };

  const handleHide = () => {
    props.hideApp();
    resetStore();
  };

  const updateItem = useCallback(
    (items: Inventory.Item[]) => {
      if (!visible) return;
      syncItems(items);
    },
    [visible, syncItems]
  );

  const fetchInventoryData = async () => {
    const activeData: Inventory.OpeningData = await nuiAction('inventory/getData', {}, devData.inventory);

    // Autofill secondary if its a shop
    let items = activeData.items;
    let secondaryData: Inventory.SecondarySide;
    let shopOpen = false;
    if ('shopItems' in activeData.secondary) {
      const generatedItems = generateShopItems(activeData.secondary.id, activeData.secondary.shopItems);
      secondaryData = { id: activeData.secondary.id, size: generatedItems.size, allowedItems: [] };
      items = { ...items, ...generatedItems.items };
      shopOpen = true;
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
      shopOpen,
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
        <Inventory />
      </DndProvider>
    </AppWrapper>
  );
};

export default Component;

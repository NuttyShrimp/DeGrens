import { Admin, RPC, Util, Inventory, Core } from '@dgx/server';
import contextManager from 'classes/contextmanager';
import locationManager from 'modules/locations/manager.locations';
import shopManager from 'modules/shops/shopmanager';
import { getConfig } from 'services/config';
import { validateIdBuildData } from './service.inventories';
import inventoryManager from './manager.inventories';
import { charModule } from 'services/core';

RPC.register(
  'inventory:server:open',
  async (src: number, secondaryBuildData: IdBuildData): Promise<OpeningData | null> => {
    const validated = validateIdBuildData(src, secondaryBuildData);
    if (!validated) {
      Util.Log(
        'inventory:invalidBuildData',
        { ...secondaryBuildData },
        `${Util.getName(src)} tried opening inventory without providing correct data`,
        src,
        true
      );
      Admin.ACBan(src, 'Tried opening inventory without providing correct data');
      return null;
    }

    const overrideBuildingSecondaryId = 'override' in secondaryBuildData;

    // Build inventory ids
    const primaryId = Inventory.concatId('player', Util.getCID(src));
    let secondaryId: string;
    if (overrideBuildingSecondaryId) {
      secondaryId = secondaryBuildData.override;
    } else {
      if (locationManager.isLocationBased(secondaryBuildData.type)) {
        const dropData = secondaryBuildData.data as { coords: Vec3; inNoDropZone?: boolean };
        secondaryId = locationManager.getLocation(
          secondaryBuildData.type as Location.Type,
          dropData.coords,
          dropData.inNoDropZone // when in no dropzones, disable checking others so player also cant pick anything up while inside no dropzone
        );
      } else if (secondaryBuildData.type === 'player') {
        secondaryId = Inventory.concatId(secondaryBuildData.type, Util.getCID(secondaryBuildData.data as number));
      } else {
        secondaryId = Inventory.concatId(secondaryBuildData.type, secondaryBuildData.identifier!);
      }
    }

    // Get inventories
    const primaryInv = await inventoryManager.get(primaryId);
    const secondaryInv = await inventoryManager.get(secondaryId);

    // On first opening of inv, check if size is dynamic and set it
    if (secondaryInv.size === 0) {
      if (overrideBuildingSecondaryId) {
        secondaryInv.setSize(100);
      } else {
        if (secondaryInv.type === 'trunk') {
          const truckSlots = getConfig().trunkSlots;
          secondaryInv.setSize(truckSlots[secondaryBuildData.data as string] ?? 10);
        } else if (secondaryInv.type === 'stash') {
          secondaryInv.setSize((secondaryBuildData.data as number) ?? 10);
        }
      }
    }

    if (
      'type' in secondaryBuildData &&
      secondaryBuildData.type === 'drop' &&
      (secondaryBuildData.data as { inNoDropZone: boolean }).inNoDropZone
    ) {
      secondaryInv.allowedItems = [];
    }

    // If shoptype get shopdata
    let secondary: OpeningData['secondary'];
    if (secondaryInv.type === 'shop') {
      const shopItems = shopManager.getItems(secondaryInv.identifier);
      secondary = { id: secondaryInv.id, shopItems };
    } else if (secondaryInv.type === 'bench') {
      const items: Shops.Item[] = global.exports['dg-materials'].getBenchItems(src, secondaryInv.identifier) ?? [];
      secondary = { id: secondaryInv.id, shopItems: items };
    } else {
      secondary = { id: secondaryInv.id, size: secondaryInv.size, allowedItems: secondaryInv.allowedItems };
    }

    Util.Log(
      'inventory:open',
      {
        secondaryId: secondaryInv.id,
      },
      `${Util.getName(src)} opened inventory ${secondaryInv.id}`,
      src
    );

    contextManager.playerOpened(src, [primaryInv.id, secondaryInv.id]);
    return {
      items: [
        ...primaryInv.getItemStates(!('shopItems' in secondary)), // for primary, we only need the items inside of containers when the other inventory has shopitems
        ...secondaryInv.getItemStates(true), // for secondary, we never need the items inside of containers
      ],
      primary: { id: primaryInv.id, size: primaryInv.size },
      secondary,
    };
  }
);

export const preloadActivePlayerInventories = () => {
  Object.values(charModule.getAllPlayers()).forEach(ply => {
    inventoryManager.get(Inventory.concatId('player', ply.citizenid));
  });
};

Core.onPlayerLoaded(async playerData => {
  const invId = Inventory.concatId('player', playerData.citizenid);
  if (!inventoryManager.isLoaded(invId)) {
    inventoryManager.get(invId); // this loads inventory
    return;
  }

  // if inventory is already loaded we force objects to reapply.
  // This can happen when player rejoin or char switches
  // We need to force this as normally objects get added from inventoryUpdate event on inventory load
  const inv = await inventoryManager.get(invId);
  inv.forceUpdateObjects();
});

Core.onPlayerUnloaded((plyId, cid) => {
  contextManager.playerClosed(plyId, true);
});

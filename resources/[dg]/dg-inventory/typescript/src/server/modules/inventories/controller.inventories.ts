import { Admin, RPC, Util, Inventory } from '@dgx/server';
import contextManager from 'classes/contextmanager';
import locationManager from 'modules/locations/manager.locations';
import shopManager from 'modules/shops/shopmanager';
import { getConfig } from 'services/config';
import { validateIdBuildData } from './service.inventories';
import inventoryManager from './manager.inventories';

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
        secondaryId = locationManager.getLocation(
          secondaryBuildData.type as Location.Type,
          secondaryBuildData.data as Vec3
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
      items: [...primaryInv.getItemStates(), ...secondaryInv.getItemStates()],
      primary: { id: primaryInv.id, size: primaryInv.size },
      secondary,
    };
  }
);

export const preloadActivePlayerInventories = () => {
  (
    Object.values({
      ...DGCore.Functions.GetQBPlayers(),
    }) as Player[]
  ).forEach((ply: Player) => {
    inventoryManager.get(Inventory.concatId('player', ply.PlayerData.citizenid));
  });
};

Util.onPlayerLoaded(playerData => {
  inventoryManager.get(Inventory.concatId('player', playerData.citizenid));
});

Util.onPlayerUnloaded((plyId, cid) => {
  contextManager.playerClosed(plyId, true);
  inventoryManager.unload(Inventory.concatId('player', cid));
});

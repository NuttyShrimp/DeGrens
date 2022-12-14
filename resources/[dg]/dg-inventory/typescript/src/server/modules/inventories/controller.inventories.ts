import { Admin, Financials, RPC, Util } from '@dgx/server';
import contextManager from 'classes/contextmanager';
import locationManager from 'modules/locations/manager.locations';
import shopManager from 'modules/shops/shopmanager';
import { getConfig } from 'services/config';
import { concatId } from '../../util';
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
      await Admin.ACBan(src, 'Tried opening inventory without providing correct data');
      return null;
    }

    const overrideBuildingSecondaryId = 'override' in secondaryBuildData;

    // Build inventory ids
    const primaryId = concatId('player', Util.getCID(src));
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
        secondaryId = concatId(secondaryBuildData.type, Util.getCID(secondaryBuildData.data as number));
      } else {
        secondaryId = concatId(secondaryBuildData.type, secondaryBuildData.identifier!);
      }
    }

    // Get inventories
    const primaryInv = await inventoryManager.get(primaryId);
    const secondaryInv = await inventoryManager.get(secondaryId);

    // On first opening of inv, check if size is dynamic and set it
    if (secondaryInv.size === 0) {
      if (overrideBuildingSecondaryId) {
        secondaryInv.size = 100;
      } else {
        if (secondaryInv.type === 'trunk') {
          const truckSlots = getConfig().trunkSlots;
          secondaryInv.size = truckSlots[secondaryBuildData.data as string] ?? 10;
        } else if (secondaryInv.type === 'stash') {
          secondaryInv.size = (secondaryBuildData.data as number) ?? 10;
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

    contextManager.playerOpened(src, [primaryInv.id, secondaryInv.id]);
    const playerCash = Financials.getCash(src);
    return {
      items: [...primaryInv.getItems(), ...secondaryInv.getItems()],
      primary: { id: primaryInv.id, size: primaryInv.size, cash: playerCash },
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
    inventoryManager.get(concatId('player', ply.PlayerData.citizenid));
  });
};

on('DGCore:server:playerLoaded', (playerData: PlayerData) => {
  inventoryManager.get(concatId('player', playerData.citizenid));
});

on('DGCore:server:playerUnloaded', (src: number, cid: number) => {
  inventoryManager.unload(concatId('player', cid));
  contextManager.playerClosed(src, true);
});

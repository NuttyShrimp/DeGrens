import { RPC, Util } from '@dgx/server';
import contextManager from 'classes/contextmanager';
import locationManager from 'modules/locations/manager.locations';
import { getConfig } from 'services/config';
import { concatId } from '../../util';
import inventoryManager from './manager.inventories';

RPC.register('inventory:server:open', async (src: number, secondary: IdBuildData): Promise<OpeningData> => {
  const primaryId = concatId('player', Util.getCID(src));
  let secondaryId: string;
  if (locationManager.isLocationBased(secondary.type)) {
    secondaryId = locationManager.getLocation(secondary.type as Location.Type, secondary.data as Vec3);
  } else if (secondary.type === 'player') {
    secondaryId = concatId(secondary.type, Util.getCID(secondary.data as number));
  } else {
    secondaryId = concatId(secondary.type, secondary.identifier!);
  }

  const primaryInv = await inventoryManager.get(primaryId);
  const secondaryInv = await inventoryManager.get(secondaryId);

  // Dynamic sizes for trunk or stash based on secondary parameter data
  if (secondaryInv.type === 'trunk') {
    const truckSlots = getConfig().trunkSlots;
    secondaryInv.size = truckSlots[secondary.data as string] ?? 10;
  } else if (secondaryInv.type === 'stash') {
    secondaryInv.size = (secondary.data as number) ?? 10;
  }

  contextManager.playerOpened(src, [primaryInv.id, secondaryInv.id]);
  const playerCash = await global.exports['dg-financials'].getCash(src);
  return {
    items: [...primaryInv.getItems(), ...secondaryInv.getItems()],
    primary: { id: primaryInv.id, size: primaryInv.size, cash: playerCash },
    secondary: { id: secondaryInv.id, size: secondaryInv.size, allowedItems: secondaryInv.allowedItems },
  };
});

export const preloadActivePlayerInventories = () => {
  const ids = DGCore.Functions.GetPlayers();
  ids.forEach(id => {
    const player = DGCore.Functions.GetPlayer(id);
    inventoryManager.get(concatId('player', player.PlayerData.citizenid));
  });
};

on('DGCore:Server:PlayerLoaded', ({ PlayerData }: { PlayerData: PlayerData }) => {
  inventoryManager.get(concatId('player', PlayerData.citizenid));
});

on('DGCore:Server:OnPlayerUnload', (src: number, cid: number) => {
  inventoryManager.unload(concatId('player', cid));
});

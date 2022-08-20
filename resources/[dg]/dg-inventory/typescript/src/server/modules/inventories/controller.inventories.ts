import { RPC, Util } from '@dgx/server';
import contextManager from 'classes/contextmanager';
import locationManager from 'modules/locations/manager.locations';
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

  if (secondaryInv.type === 'trunk') {
    secondaryInv.setTrunkSize(secondary.data as string);
  }

  contextManager.playerOpened(src, [primaryInv.id, secondaryInv.id]);
  const playerCash = await global.exports['dg-financials'].getCash(src);
  return {
    items: [...primaryInv.getItems(), ...secondaryInv.getItems()],
    primary: { id: primaryInv.id, size: primaryInv.size, cash: playerCash },
    secondary: { id: secondaryInv.id, size: secondaryInv.size, allowedItems: secondaryInv.allowedItems },
  };
});

on('DGCore:Server:PlayerLoaded', ({ PlayerData }: { PlayerData: PlayerData }) => {
  inventoryManager.get(concatId('player', PlayerData.citizenid));
});

on('DGCore:Server:OnPlayerUnload', (src: number, cid: number) => {
  inventoryManager.unload(concatId('player', cid));
});

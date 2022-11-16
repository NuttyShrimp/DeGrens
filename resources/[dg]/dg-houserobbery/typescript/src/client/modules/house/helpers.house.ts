import { Events, Inventory, Minigames, Notifications, PolyZone, RPC, Util } from '@dgx/client';
import { enterInterior, leaveInterior } from 'services/interiors';

export const unlockHouse = async (houseId: string) => {
  if (houseId == undefined) return;

  const houseState = await RPC.execute<boolean>('houserobbery:server:getDoorState', houseId);
  if (houseState) {
    Notifications.add('Deze deur is al los...', 'error');
    return;
  }

  const hasCrowbar = global.exports['dg-weapons'].getCurrentWeaponData()?.name == 'weapon_crowbar' ?? false;
  const hasLockpick = hasCrowbar ? false : await Inventory.doesPlayerHaveItems('lockpick');
  if (!hasCrowbar && !hasLockpick) {
    Notifications.add('Hoe ga je dit openen?', 'error');
    return;
  }

  const keygameSuccess = await Minigames.keygame(3, 7, 20);
  if (keygameSuccess) {
    Notifications.add('De deur is opengebroken!', 'success');
    Events.emitNet('houserobbery:server:unlockDoor', houseId);
  } else {
    if (Util.getRndInteger(0, 100) < 10) {
      DGX.Inventory.removeItemFromPlayer('lockpick');
      Notifications.add('Je lockpick is gebroken', 'error');
    } else {
      Notifications.add('Je bent uitgeschoven', 'error');
      Events.emitNet('police:evidence:dropBloop');
    }
  }
};

export const enterHouse = async (houseId: number) => {
  if (houseId == undefined) return;

  const houseState = await RPC.execute<boolean>('houserobbery:server:getDoorState', houseId);
  if (!houseState) {
    Notifications.add('Deze deur is nog vast.', 'error');
    return;
  }

  enterInterior();
};

export const leaveHouse = () => {
  leaveInterior();
  PolyZone.removeZone('houserobbery_exit');
};

export const lockHouse = async (houseId: number) => {
  if (houseId == undefined) return;

  const houseState = await RPC.execute<boolean>('houserobbery:server:getDoorState', houseId);
  if (!houseState) {
    Notifications.add('Deze deur is al vast.', 'error');
    return;
  }

  Notifications.add('Je hebt het huis vergrendeld', 'success');
  Events.emitNet('houserobbery:server:lockDoor', houseId);
};

export const canSearchLocation = async (houseId: string, zoneName: string): Promise<boolean> => {
  if (zoneName == undefined) return false;
  return RPC.execute('houserobbery:server:canLootZone', houseId, zoneName);
};

export const searchLootLocation = async (houseId: string, zoneName: string, lootTableId = 0) => {
  if (!houseId || !zoneName) return;
  Events.emitNet('houserobbery:server:doLootZone', houseId, zoneName, lootTableId);
};

import { Chat, Core, Events, Inventory, Jobs, Notifications, Taskbar } from '@dgx/server';
import { charModule } from './core';

const playersFillingArmor = new Set<number>();

const RETRIEVABLE_ARMOR = ['armor', 'pd_armor'];

Inventory.registerUseable(['armor', 'pd_armor'], async (plyId, itemState) => {
  const [canceled] = await Taskbar.create(plyId, 'vest', 'Aantrekken', 5000, {
    canCancel: true,
    cancelOnDeath: true,
    disableInventory: true,
    disablePeek: true,
    controlDisables: {
      combat: true,
    },
  });
  if (canceled) return;

  const removed = await Inventory.removeItemByIdFromPlayer(plyId, itemState.id);
  if (!removed) {
    Notifications.add(plyId, 'Je hebt dit niet', 'error');
    return;
  }

  const max = GetPlayerMaxArmour(String(plyId));
  setArmor(plyId, ((itemState.metadata?.health ?? 100) / 100) * max, itemState.name);
});

Core.onPlayerLoaded(playerData => {
  setTimeout(() => {
    if (!playerData.serverId) return;
    const armor = playerData?.metadata?.armor ?? 0;
    const armorItem = playerData?.metadata?.armorItem ?? null;
    setArmor(playerData.serverId, armor, armorItem, true);
  }, 5000);
});

export const setArmor = (
  plyId: number,
  amount: number | ((oldAmount: number) => number),
  item: string | null,
  doNotSave = false
) => {
  const player = Core.getPlayer(plyId);
  if (!player) return;

  const ped = GetPlayerPed(String(plyId));

  let newAmount: number;
  if (typeof amount === 'function') {
    newAmount = amount(+GetPedArmour(ped));
  } else {
    newAmount = amount;
  }

  SetPedArmour(ped, Math.round(newAmount)); // cannot set decimal

  if (!doNotSave) {
    player.updateMetadata('armor', newAmount);
    player.updateMetadata('armorItem', item);
  }
};
global.exports('setArmor', setArmor);

const giveArmorAsItem = async (plyId: number) => {
  const player = charModule.getPlayer(plyId);
  if (!player) return;

  const currentArmorItem = player.metadata?.armorItem;
  if (!currentArmorItem || RETRIEVABLE_ARMOR.indexOf(currentArmorItem) === -1) {
    Notifications.add(plyId, 'Je kan je huidige armor niet uittrekken', 'error');
    return;
  }

  const ped = GetPlayerPed(String(plyId));
  let armor = GetPedArmour(ped);
  if (armor <= 0) {
    Notifications.add(plyId, 'Je hebt geen armor aan', 'error');
    return;
  }

  const [canceled] = await Taskbar.create(plyId, 'vest', 'Uittrekken', 5000, {
    canCancel: true,
    cancelOnDeath: true,
    disableInventory: true,
    disablePeek: true,
    disarm: true,
    controlDisables: {
      combat: true,
    },
  });
  if (canceled) return;

  armor = GetPedArmour(ped);
  if (armor <= 0) {
    Notifications.add(plyId, 'Je hebt geen armor aan', 'error');
    return;
  }

  const max = GetPlayerMaxArmour(String(plyId));
  Inventory.addItemToPlayer(plyId, currentArmorItem, 1, {
    health: Math.round((armor / max) * 100),
  });

  setArmor(plyId, 0, null);
};

Events.onNet('hospital:armor:retrieve', giveArmorAsItem);

Chat.registerCommand('retrieveArmor', 'Doe je armor af', [], 'user', giveArmorAsItem);

export const startRefillingArmorForPlayer = (plyId: number, time: number, itemName: string) => {
  const increasePerInteration = Math.round((100 / (time / 2)) * 10) / 10;
  let counter = time / 2;
  const thread = setInterval(() => {
    setArmor(
      plyId,
      oldArmor => {
        const newArmor = Math.min(oldArmor + increasePerInteration, 100);
        if (newArmor >= 100) {
          clearInterval(thread);
          playersFillingArmor.delete(plyId);
        }
        return newArmor;
      },
      itemName
    );

    counter--;
    if (counter <= 0) {
      clearInterval(thread);
      playersFillingArmor.delete(plyId);
    }
  }, 2000);
  playersFillingArmor.add(plyId);
};

export const isPlayerFillingArmor = (plyId: number) => {
  return playersFillingArmor.has(plyId);
};

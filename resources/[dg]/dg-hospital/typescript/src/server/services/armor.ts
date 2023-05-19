import { Chat, Core, Events, Inventory, Jobs, Notifications, Taskbar } from '@dgx/server';

Inventory.registerUseable(['armor', 'pd_armor'], async (plyId, itemState) => {
  const [canceled] = await Taskbar.create(plyId, 'vest', 'Aantrekken', 5000, {
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

  const removed = await Inventory.removeItemByIdFromPlayer(plyId, itemState.id);
  if (!removed) {
    Notifications.add(plyId, 'Je hebt dit niet', 'error');
    return;
  }

  const max = GetPlayerMaxArmour(String(plyId));
  setArmor(plyId, ((itemState.metadata?.health ?? 100) / 100) * max);
});

Core.onPlayerLoaded(playerData => {
  setTimeout(() => {
    const armor = playerData?.metadata?.armor ?? 0;
    if (!playerData.serverId) return;
    setArmor(playerData.serverId, armor, true);
  }, 5000);
});

export const setArmor = (plyId: number, armor: number, doNotSave = false) => {
  const player = Core.getPlayer(plyId);
  if (!player) return;

  const ped = GetPlayerPed(String(plyId));
  SetPedArmour(ped, armor);

  if (!doNotSave) {
    player.updateMetadata('armor', armor);
  }
};
global.exports('setArmor', setArmor);

const giveArmorAsItem = async (plyId: number) => {
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
  const job = Jobs.getCurrentJob(plyId);
  Inventory.addItemToPlayer(plyId, ['police', 'ambulance'].includes(job ?? '') ? 'pd_armor' : 'armor', 1, {
    health: (armor / max) * 100,
  });

  setArmor(plyId, 0);
};

Events.onNet('hospital:armor:retrieve', giveArmorAsItem);

Chat.registerCommand('retrieveArmor', 'Doe je armor af', [], 'user', giveArmorAsItem);

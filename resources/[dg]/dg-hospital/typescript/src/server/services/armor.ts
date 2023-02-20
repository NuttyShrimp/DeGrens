import { Inventory, Notifications, Taskbar, Util } from '@dgx/server';

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
  setArmor(plyId, max);
});

Util.onPlayerLoaded(playerData => {
  setTimeout(() => {
    const armor = playerData?.metadata?.armor ?? 0;
    setArmor(playerData.source, armor, true);
  }, 5000);
});

export const setArmor = (plyId: number, armor: number, doNotSave = false) => {
  const player = DGCore.Functions.GetPlayer(plyId);
  if (!player) return;

  const ped = GetPlayerPed(String(plyId));
  SetPedArmour(ped, armor);

  if (!doNotSave) {
    player.Functions.SetMetaData('armor', armor);
  }
};
global.exports('setArmor', setArmor);

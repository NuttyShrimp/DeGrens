import { Inventory, Notifications, Taskbar } from '@dgx/server';

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

  const removed = await Inventory.removeItemAmountFromPlayer(plyId, itemState.name, 1);
  if (!removed) {
    Notifications.add(plyId, 'Je hebt dit niet', 'error');
    return;
  }

  const max = GetPlayerMaxArmour(String(plyId));
  setArmor(plyId, max);
});

on('DGCore:server:playerLoaded', (playerData: PlayerData) => {
  const armor = playerData?.metadata?.armor ?? 0;
  setArmor(playerData.source, armor);
});

export const setArmor = (plyId: number, armor: number) => {
  const player = DGCore.Functions.GetPlayer(plyId);
  if (!player) return;
  const ped = GetPlayerPed(String(plyId));
  SetPedArmour(ped, armor);
  player.Functions.SetMetaData('armor', armor);
};
global.exports('setArmor', setArmor);

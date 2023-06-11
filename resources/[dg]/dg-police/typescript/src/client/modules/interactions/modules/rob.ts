import { Events, RPC, Taskbar, Util } from '@dgx/client';

const getPlayerToRob = async () => {
  const closestPly = Util.getClosestPlayerInDistanceAndOutsideVehicle(2);
  if (!closestPly) return;
  const target = GetPlayerServerId(closestPly);
  const canRob = await RPC.execute<Police.CanRob>('police:interactions:canRobPlayer', target);

  switch (canRob) {
    case 'allowed':
      return target;
    case 'notAllowed':
      return;
    case 'checkAnim':
      const targetPed = GetPlayerPed(closestPly);
      if (IsEntityPlayingAnim(targetPed, 'missminuteman_1ig_2', 'handsup_base', 3)) {
        return target;
      }
  }
};

global.asyncExports('getPlayerToRob', getPlayerToRob);

on('police:robPlayer', async () => {
  const [canceled] = await Taskbar.create('people-robbery', 'Beroven', 5000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disablePeek: true,
    disableInventory: true,
    controlDisables: {
      combat: true,
      movement: true,
      carMovement: true,
    },
    animation: {
      animDict: 'random@shop_robbery',
      anim: 'robbery_action_b',
      flags: 16,
    },
  });
  if (canceled) return;

  const target = await getPlayerToRob();
  if (!target) return;
  Events.emitNet('police:interactions:robPlayer', target);
});

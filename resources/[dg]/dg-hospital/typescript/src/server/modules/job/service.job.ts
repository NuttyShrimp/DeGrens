import { Notifications, Taskbar, Util } from '@dgx/server';
import { revivePlayer } from 'modules/down/service.down';

export const healClosestPlayer = async (plyId: number) => {
  const target = Util.getClosestPlayerOutsideVehicle(plyId);
  if (target === undefined) {
    Notifications.add(plyId, 'Er is niemand in de buurt', 'error');
    return;
  }

  const [canceled] = await Taskbar.create(plyId, 'kit-medical', 'Verzorgen', 10000, {
    cancelOnDeath: true,
    cancelOnMove: true,
    canCancel: true,
    disablePeek: true,
    disarm: true,
    controlDisables: {
      combat: true,
      movement: true,
      carMovement: true,
    },
    animation: {
      animDict: 'mini@cpr@char_a@cpr_str',
      anim: 'cpr_pumpchest',
      flags: 17,
    },
  });
  if (canceled) return;

  Util.Log('hospital:job:heal', { target }, `${Util.getName(plyId)} has healed ${Util.getName(target)}`, plyId);

  revivePlayer(target);
};

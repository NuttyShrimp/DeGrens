import { Notifications, Taskbar, Util } from '@dgx/server';
import { revivePlayer } from 'modules/down/service.down';
import { charModule } from 'services/core';

export const healClosestPlayer = async (plyId: number, doRestrictions = false) => {
  const target = Util.getClosestPlayerOutsideVehicle(plyId);
  if (target === undefined) {
    Notifications.add(plyId, 'Er is niemand in de buurt', 'error');
    return;
  }

  // first restriction is only being able to res dead players
  if (doRestrictions) {
    const downState = charModule.getPlayer(target)?.metadata.downState ?? 'alive';
    if (downState !== 'dead') {
      Notifications.add(plyId, 'Deze persoon is niet neer', 'error');
      return;
    }
  }

  // second restriction is duration of taskbar
  const [canceled] = await Taskbar.create(plyId, 'kit-medical', 'Verzorgen', doRestrictions ? 45000 : 10000, {
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

  Util.Log(
    'hospital:job:heal',
    { target },
    `${Util.getName(plyId)}(${plyId}) has healed ${Util.getName(target)}(${target})}`,
    plyId
  );

  revivePlayer(target);
};

import { PropAttach, Util } from '@dgx/client';

let attachedBox: number | null = null;
let animThread: NodeJS.Timer | null = null;

// move to looped anim wrapper

export const attachBox = async () => {
  if (attachedBox !== null) return;

  attachedBox = PropAttach.add('cardbox');

  const ped = PlayerPedId();
  await Util.loadAnimDict('anim@heists@box_carry@');
  TaskPlayAnim(ped, 'anim@heists@box_carry@', 'idle', 2.0, 2.0, -1, 51, 0, false, false, false);

  animThread = setInterval(() => {
    if (attachedBox === null) {
      clearAnimThread();
      return;
    }

    DisablePlayerFiring(PlayerId(), true);

    if (!IsEntityPlayingAnim(ped, 'anim@heists@box_carry@', 'idle', 3)) {
      ClearPedTasks(ped);
      TaskPlayAnim(ped, 'anim@heists@box_carry@', 'idle', 2.0, 2.0, -1, 51, 0, false, false, false);
    }
  }, 1);
};

export const removeBox = () => {
  if (attachedBox === null) return;

  PropAttach.remove(attachedBox);
  attachedBox = null;

  clearAnimThread();
};

const clearAnimThread = () => {
  if (animThread === null) return;
  clearInterval(animThread);
  animThread = null;
  StopAnimTask(PlayerPedId(), 'anim@heists@box_carry@', 'idle', 1.0);
};

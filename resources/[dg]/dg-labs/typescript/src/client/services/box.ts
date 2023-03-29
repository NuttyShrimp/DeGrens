import { Animations, PropAttach } from '@dgx/client';

let isBoxAttached = false;
let boxPropId: number | null = null;
let boxAnimLoopId: number | null = null;

export const attachBox = async () => {
  if (isBoxAttached) return;

  isBoxAttached = true;

  boxPropId = PropAttach.add('cardbox');
  boxAnimLoopId = Animations.startAnimLoop({
    animation: {
      dict: 'anim@heists@box_carry@',
      name: 'idle',
      flag: 51,
    },
    weight: 10,
    disableFiring: true,
  });
};

export const removeBox = () => {
  if (!isBoxAttached) return;

  if (boxPropId !== null) {
    PropAttach.remove(boxPropId);
    boxPropId = null;
  }

  if (boxAnimLoopId !== null) {
    Animations.stopAnimLoop(boxAnimLoopId);
    boxAnimLoopId = null;
  }

  isBoxAttached = false;
};

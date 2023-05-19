import { Util } from '@dgx/client';
import { debug } from './helpers.animloops';

let threads: { anim: NodeJS.Timer; keys: NodeJS.Timer } | null = null;

let nextAnimLoopId = 1;
const activeAnimLoops = new Map<number, AnimLoops.Anim>();

let activeData: AnimLoops.Active | null = null;

let animationsPaused = false;

export const startAnimLoop = (anim: AnimLoops.Anim) => {
  const animLoopId = nextAnimLoopId++;

  activeAnimLoops.set(animLoopId, anim);
  buildActiveData();
  startThreads();

  debug(`Started id ${animLoopId}`);

  return animLoopId;
};

export const stopAnimLoop = (animLoopId: number) => {
  const oldAnimLoop = activeAnimLoops.get(animLoopId);
  if (!oldAnimLoop) {
    debug(`Tried to stop nonactive animloop with id ${animLoopId}`);
    return;
  }

  activeAnimLoops.delete(animLoopId);

  if (activeAnimLoops.size === 0 && activeData) {
    StopAnimTask(PlayerPedId(), activeData.animation.dict, activeData.animation.name, 1.0);
  }

  buildActiveData();
  clearThreads();

  // if new and old are not same, remove old anim dict from memory
  if (activeData?.animation.dict !== oldAnimLoop.animation.dict) {
    RemoveAnimDict(oldAnimLoop.animation.dict);
  }

  debug(`Stopped id ${animLoopId}`);
};

export const modifyAnimLoop = (animLoopId: number, partialAnimLoop: Partial<AnimLoops.Anim>) => {
  const animLoop = activeAnimLoops.get(animLoopId);
  if (!animLoop) return;

  activeAnimLoops.set(animLoopId, { ...animLoop, ...partialAnimLoop });

  buildActiveData();
  startThreads();

  debug(`Changed animloop id ${animLoopId} animation`);
};

const startThreads = () => {
  if (threads) return;

  let wasRagdolling = false;

  threads = {
    anim: setInterval(() => {
      if (animationsPaused) return;

      if (!activeData) return;
      const { name: animName, dict: animDict, flag: animFlag } = activeData.animation;

      if (!HasAnimDictLoaded(animDict)) return;

      const ped = PlayerPedId();
      const animPlaying = IsEntityPlayingAnim(ped, animDict, animName, 3);
      const ragdolling = IsPedRagdoll(ped);

      const holdingDoor = IsPedOpeningADoor(ped); // case of another native anim that gets looped

      // Otherwise will not resume
      if (!ragdolling && wasRagdolling) {
        StopAnimTask(ped, animDict, animName, 1.0);
      }

      if (!animPlaying && !holdingDoor) {
        ClearPedTasks(ped);
        TaskPlayAnim(ped, animDict, animName, 8.0, 8.0, -1, animFlag, 0, false, false, false);
      }

      wasRagdolling = ragdolling;
    }, 100),
    keys: setInterval(() => {
      if (!activeData) return;

      if (activeData.disableAllControls) {
        DisableAllControlActions(0);
        activeData.enabledControls.forEach(c => EnableControlAction(0, c, true));
      } else {
        activeData.disabledControls.forEach(c => DisableControlAction(0, c, true));
      }

      if (activeData.disableFiring) {
        DisablePlayerFiring(PlayerId(), true);
      }
    }, 1),
  };
};

const clearThreads = () => {
  if (activeData !== null) return;
  if (!threads) return;
  Object.values(threads).forEach(t => clearInterval(t));
  threads = null;
};

const buildActiveData = () => {
  if (activeAnimLoops.size === 0) {
    activeData = null;
    return;
  }

  let heighestWeightAnim = activeAnimLoops.values().next().value as AnimLoops.Anim;
  let disableFiring = false;

  const mergedDisabledControls: AnimLoops.Active['disabledControls'] = new Set();
  const mergedEnabledControls: AnimLoops.Active['enabledControls'] = new Set();
  let disableAllControls = false;

  for (const [_, animLoop] of activeAnimLoops) {
    const isHeigherWeight = (animLoop?.weight ?? 0) > (heighestWeightAnim?.weight ?? 0);
    if (isHeigherWeight) {
      heighestWeightAnim = animLoop;
    }

    if (animLoop.disableFiring) {
      disableFiring = true;
    }

    if ('disableAllControls' in animLoop) {
      disableAllControls = true;
      animLoop.enabledControls?.forEach(c => mergedEnabledControls.add(c));
    } else if ('disabledControls' in animLoop) {
      animLoop.disabledControls?.forEach(c => mergedDisabledControls.add(c));
    }
  }

  // if a key is specifally enabled but disabled from another animloop, disable anyway
  for (const enabledKey of mergedEnabledControls) {
    if (mergedDisabledControls.has(enabledKey)) {
      mergedEnabledControls.delete(enabledKey);
    }
  }

  activeData = {
    animation: heighestWeightAnim.animation,
    weight: heighestWeightAnim.weight ?? 0,
    disableFiring,
    disableAllControls,
    disabledControls: mergedDisabledControls,
    enabledControls: mergedEnabledControls,
  };

  Util.loadAnimDict(activeData.animation.dict);
};

export const setAnimationsPaused = (pause: boolean) => {
  animationsPaused = pause;
};

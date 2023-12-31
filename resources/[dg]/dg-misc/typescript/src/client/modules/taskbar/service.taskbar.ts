import { Hospital, PropAttach, UI, Util, Weapons, Peek } from '@dgx/client';
import { disabledControlMap, TaskbarState } from './constants.taskbar';

let state: TaskbarState = TaskbarState.Idle;
const runningTaskbar: { id: string | null; settings: TaskBar.TaskBarSettings } = {
  id: null,
  settings: {},
};

let attachedProp: number | null = null;

export const taskbar = async (
  icon: string,
  label: string,
  duration: number,
  settings: TaskBar.TaskBarSettings,
  id?: string
): Promise<[boolean, number]> => {
  if (state !== TaskbarState.Idle) return [true, 0];

  const ped = PlayerPedId();
  if (settings.cancelOnDeath && (IsEntityDead(ped) || Hospital.isDown())) {
    return [true, 0];
  }
  if (settings.disarm) {
    Weapons.removeWeapon();
  }
  if (settings.disableInventory) {
    LocalPlayer.state.set('inv_busy', true, true);
  }
  if (settings.disablePeek) {
    Peek.setPeekEnabled(false);
  }
  if (settings.animation) {
    doAnimation(ped, settings.animation);
  }
  if (settings.prop) {
    attachedProp = PropAttach.add(settings.prop);
  }

  state = TaskbarState.Running;
  runningTaskbar.id = id ?? `taskbarid-${Util.getRndInteger(0, 999999)}`;
  runningTaskbar.settings = settings;

  openTaskBarUI(icon, label, duration, runningTaskbar.id);

  const endTime = GetGameTimer() + duration;
  const [finishState, finishTime] = await doTaskbarThread(endTime);
  state = finishState;

  let wasCanceled = false;
  let atPercentage = 100;
  if (state === TaskbarState.Canceled) {
    wasCanceled = true;
    atPercentage = Math.ceil(100 - ((endTime - finishTime) / duration) * 100);
    openTaskBarUI(icon, 'Geannuleerd', 1000, runningTaskbar.id);
    await Util.Delay(1000);
  }

  UI.closeApplication('taskbar');
  cleanUp(settings);

  return [wasCanceled, atPercentage];
};

export const cancelTaskbar = () => {
  if (state !== TaskbarState.Running) return;
  if (!runningTaskbar.settings.canCancel) return;
  state = TaskbarState.Canceled;
};

const doAnimation = async (ped: number, settings: TaskBar.TaskBarSettings['animation']) => {
  if (!settings) return;
  if ('task' in settings) {
    Util.startScenarioInPlace(settings.task);
  } else {
    await Util.loadAnimDict(settings.animDict);
    TaskPlayAnim(ped, settings.animDict, settings.anim, 3.0, 3.0, -1, settings.flags ?? 1, 0, false, false, false);
  }
};

const openTaskBarUI = (icon: string, label: string, duration: number, id: string) => {
  UI.openApplication('taskbar', { icon, label, duration, id });
};

const doTaskbarThread = async (endTime: number): Promise<[TaskbarState, number]> => {
  let retval: TaskbarState = TaskbarState.Running;
  let currentTime = GetGameTimer();

  const ped = PlayerPedId();
  const plyId = PlayerId();
  const startPosition = Util.getPlyCoords();

  const disabledControls = Object.entries(disabledControlMap).reduce<number[]>((acc, [type, actions]) => {
    if (!runningTaskbar.settings.controlDisables) return [];
    if (!runningTaskbar.settings.controlDisables[type as keyof TaskBar.TaskBarSettings['controlDisables']]) return acc;
    return [...acc, ...actions];
  }, []);
  const disableFiring = runningTaskbar.settings.controlDisables?.combat === true;

  const taskbarThread = setInterval(() => {
    let newState: TaskbarState = TaskbarState.Running;

    // Check duration
    currentTime = GetGameTimer();
    if (currentTime >= endTime) {
      newState = TaskbarState.Completed;
    }

    // Check settings
    const isDead = IsEntityDead(ped) || Hospital.isDown();
    const moved = startPosition.distance(Util.getPlyCoords()) > 1 || IsPedRagdoll(ped);
    if ((runningTaskbar.settings.cancelOnDeath && isDead) || (runningTaskbar.settings.cancelOnMove && moved)) {
      newState = TaskbarState.Canceled;
    }

    // Check if canceled via keybind
    if (state !== TaskbarState.Running) {
      newState = state;
    }

    // Disable controls
    disabledControls.forEach(control => DisableControlAction(0, control, true));
    if (disableFiring) {
      DisablePlayerFiring(plyId, true);
    }

    // If state has been set than clear
    if (newState !== TaskbarState.Running) {
      clearInterval(taskbarThread);
      retval = newState;
      return;
    }
  }, 0);
  await Util.awaitCondition(() => retval !== TaskbarState.Running, 9999999); // no timing out
  return [retval, currentTime];
};

const cleanUp = (settings: TaskBar.TaskBarSettings) => {
  const ped = PlayerPedId();
  if (runningTaskbar.settings.animation) {
    if ('task' in runningTaskbar.settings.animation) {
      ClearPedTasks(ped);
    } else {
      ClearPedSecondaryTask(ped);
      StopAnimTask(ped, runningTaskbar.settings.animation.animDict, runningTaskbar.settings.animation.anim, 1.0);
    }
  }
  if (attachedProp !== null) {
    PropAttach.remove(attachedProp);
    attachedProp = null;
  }
  runningTaskbar.id = null;
  runningTaskbar.settings = {};
  LocalPlayer.state.set('inv_busy', false, true);
  if (settings.disablePeek) {
    Peek.setPeekEnabled(true);
  }
  state = TaskbarState.Idle;
};

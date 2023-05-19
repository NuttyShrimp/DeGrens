import { closePhone } from './mgmt';
import { getState, setState } from './state';

let controlDisableThread: number | null = null;
let pauseCheckThread: NodeJS.Timer | null = null;

const DISABLED_CONTROLS = [
  0, // Next Camera
  1, // Look Left/Right
  2, // Look Up/Down
  16, // Next Weapon
  17, // Select Previous Weapon
  22, // Jump
  24, // Attack
  25, // Aim
  26, // Look Behind
  36, // Input Duck/Sneak
  37, // Weapon Wheel
  44, // Cover
  47, // Detonate
  55, // Dive
  75, // Exit Vehicle
  76, // Vehicle Handbrake
  81, // Next Radio (Vehicle)
  82, // Previous Radio (Vehicle)
  91, // Passenger Aim (Vehicle)
  92, // Passenger Attack (Vehicle)
  99, // Select Next Weapon (Vehicle)
  106, // Control Override (Vehicle)
  114, // Fly Attack (Flying)
  115, // Next Weapon (Flying)
  121, // Fly Camera (Flying)
  122, // Control OVerride (Flying)
  135, // Control OVerride (Sub)
  199, // Pause Menu
  200, // Pause Menu
  245, // Chat
];

export const disablePauseMenu = () => {
  let timer = 0;
  const interval = setTick(() => {
    if (timer > 100 || IsDisabledControlJustPressed(0, 199) || IsDisabledControlJustPressed(0, 200)) {
      clearTick(interval);
      return;
    }
    timer++;
    if (IsPauseMenuActive()) {
      SetPauseMenuActive(false);
    }
    DisableControlAction(0, 199, true);
    DisableControlAction(0, 200, true);
  });
};

export const checkControlLoop = (state: number) => {
  if (state !== 1) {
    if (!controlDisableThread) return;
    clearTick(controlDisableThread);
    controlDisableThread = null;
    return;
  }
  if (controlDisableThread) return;
  controlDisableThread = setTick(() => {
    if (getState('inputFocused')) {
      DisableAllControlActions(0);
      EnableControlAction(0, 46, true); // push to talk
      EnableControlAction(0, 249, true); // push to talk
    } else {
      DISABLED_CONTROLS.forEach(control => {
        DisableControlAction(0, control, true);
      });
      SetPauseMenuActive(false);
    }
  });
};

export const startPauseCheck = () => {
  let cachedPauseStatus = false;
  pauseCheckThread = setInterval(() => {
    const menuOpen = IsPauseMenuActive();
    if (menuOpen && !cachedPauseStatus) {
      cachedPauseStatus = true;
      setState('isDisabled', true);
    } else if (!menuOpen && cachedPauseStatus) {
      cachedPauseStatus = false;
      setState('isDisabled', false);
    }

    if (menuOpen && getState('state') !== 0) {
      closePhone();
    }
  }, 500);
};

export const cleanupPauseCheck = () => {
  if (pauseCheckThread) {
    clearInterval(pauseCheckThread);
    pauseCheckThread = null;
  }
};

import { doScheduledCleanup } from './sounds';

let keyThread = 0;

setImmediate(() => {
  RequestScriptAudioBank('DLC_NUTTY\\SIRENS', false);
});

setInterval(() => {
  doScheduledCleanup();
}, 1000);

export const cleanupKeyThread = () => {
  if (!keyThread) return;
  clearTick(keyThread);
  keyThread = 0;
};

export const createKeyThread = (preventRestart = false) => {
  if (keyThread) {
    if (preventRestart) return;
    cleanupKeyThread();
  }
  keyThread = setTick(() => {
    DisableControlAction(0, 80, true);
    DisableControlAction(0, 81, true);
    DisableControlAction(0, 82, true);
    DisableControlAction(0, 83, true);
    DisableControlAction(0, 84, true);
    DisableControlAction(0, 85, true);
    DisableControlAction(0, 86, true);
    DisableControlAction(0, 172, true);
  });
};

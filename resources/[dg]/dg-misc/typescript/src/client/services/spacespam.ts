let timesPressed = 0;
let checkThread: NodeJS.Timer | null;
let timeout: NodeJS.Timeout | null = null;

setImmediate(() => {
  scheduleThread();
});

const scheduleThread = () => {
  cleanupThread();
  checkThread = setInterval(() => {
    if (IsControlJustPressed(0, 22)) {
      if (timesPressed > 3) {
        const player = PlayerPedId();
        if (
          !IsPedRagdoll(player) &&
          IsPedOnFoot(player) &&
          !IsPedSwimming(player) &&
          GetPedParachuteState(player) === -1
        ) {
          const fVector = GetEntityForwardVector(player);
          SetPedToRagdollWithFall(
            player,
            1000,
            1500,
            1,
            fVector[0],
            fVector[1],
            fVector[2],
            1.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0
          );
        }
        timesPressed = 0;
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
      } else {
        timesPressed++;
        if (!timeout) {
          timeout = setTimeout(() => {
            timesPressed = 0;
            timeout = null;
          }, 4000);
        } else {
          timeout.refresh();
        }
      }
    }
  }, 2);
};

const cleanupThread = () => {
  if (!checkThread) return;
  clearInterval(checkThread);
  timesPressed = 0;
};

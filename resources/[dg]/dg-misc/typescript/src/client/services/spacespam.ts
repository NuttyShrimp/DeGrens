let spacePressed = false;
let checkThread: NodeJS.Timer | null;

setImmediate(() => {
  scheduleThread();
});

const scheduleThread = () => {
  cleanupThread();
  checkThread = setInterval(() => {
    if (IsControlJustPressed(0, 22)) {
      if (spacePressed) {
        const player = PlayerPedId();
        if (!IsPedRagdoll(player) && IsPedOnFoot(player) && !IsPedSwimming(player)) {
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
        spacePressed = false;
      } else {
        spacePressed = true;
      }
    }
  }, 100);
};

const cleanupThread = () => {
  if (!checkThread) return;
  clearInterval(checkThread);
  spacePressed = false;
};

on('onResourceStop', (res: string) => {
  if (res !== GetCurrentResourceName()) return;
  cleanupThread();
});

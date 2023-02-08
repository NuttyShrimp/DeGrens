import { Events, Taskbar, Util, Sync } from '@dgx/client';
import { isVehicleUpsideDown } from '@helpers/vehicle';

// Disables being able to roll vehicle over
let rolloverThread: NodeJS.Timer | null = null;

export const startVehicleRolloverThread = (vehicle: number) => {
  rolloverThread = setInterval(() => {
    if (GetEntitySpeed(vehicle) > 5 || !isVehicleUpsideDown(vehicle)) return;
    DisableControlAction(2, 59, true); // Disable left/right
    DisableControlAction(2, 60, true); // Disable up/down
  }, 1);
};

export const clearVehicleRolloverThread = () => {
  if (rolloverThread === null) return;
  clearInterval(rolloverThread);
  rolloverThread = null;
};

export const flipVehicle = async (vehicle: number) => {
  const [canceled] = await Taskbar.create('hand', 'Omduwen', 30000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disarm: true,
    disableInventory: true,
    controlDisables: {
      movement: true,
      carMovement: true,
      combat: true,
    },
    animation: {
      animDict: 'missfinale_c2ig_11',
      anim: 'pushcar_offcliff_m',
      flags: 35,
    },
  });
  if (canceled) return;
  Sync.executeNative('setVehicleOnGround', vehicle);
};

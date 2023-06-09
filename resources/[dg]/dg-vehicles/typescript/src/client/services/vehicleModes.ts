import { Events, HUD, Keys, RPC, Notifications } from '@dgx/client';
import { CLASS_ORDER } from '@shared/identification/constant.identification';
import { driverThread } from 'threads/driver';
import { applyHandlingMultipliers, resetHandlingContextMultiplier, setHandlingContextMultiplier } from './handling';

let vehicleModes: Record<number, Record<string, Record<Vehicles.Handlings.HandlingEntry, number>>> = {};
let curVehModeNames: string[] = [];
let modeSyncTimeout: NodeJS.Timeout | null = null;

Events.onNet(
  'vehicles:modes:load',
  (modes: Record<number, Record<string, Record<Vehicles.Handlings.HandlingEntry, number>>>) => {
    vehicleModes = modes;
  }
);

const applyVehicleMode = (mode: string) => {
  if (!driverThread.data.vehicle) return;
  const veh = driverThread.data.vehicle;
  if (mode === 'base') {
    resetHandlingContextMultiplier(veh, 'vehicleMode');
    return;
  }

  const handling = vehicleModes[driverThread.data.config.model][mode];
  if (!handling) return;

  for (const [key, value] of Object.entries(handling)) {
    setHandlingContextMultiplier(veh, key as Vehicles.Handlings.HandlingEntry, 'vehicleMode', 'add', value, 1);
  }
  applyHandlingMultipliers(veh);
};

driverThread.addHook('afterStart', ref => {
  if (!ref.data.config || !vehicleModes[ref.data.config.model]) return;
  let vehMode = Entity(ref.data.vehicle).state.vehicleMode;

  if (!vehMode) {
    vehMode = 0;
  }
  driverThread.data.vehicleMode = vehMode;

  const modeNames = ['base', ...Object.keys(vehicleModes[ref.data.config.model])];
  curVehModeNames = modeNames.map(m => m.toLowerCase()).sort((a, b) => CLASS_ORDER.indexOf(a) - CLASS_ORDER.indexOf(b));

  HUD.addEntry('vehicleMode', 'bolt', '#6d3ac2', () => ref.data.vehicleMode + 1, 4, modeNames.length);
});

driverThread.addHook('preStop', () => {
  HUD.removeEntry('vehicleMode');
  Entity(driverThread.data.vehicle).state.set('vehicleMode', driverThread.data.vehicleMode, true);
  resetHandlingContextMultiplier(driverThread.data.vehicle, 'vehicleMode');
});

Keys.onPressDown('cycleVehicleMode', () => {
  if (!driverThread.isActive || driverThread.data.vehicleMode === undefined) return;

  const prevModeName = curVehModeNames[driverThread.data.vehicleMode];
  const nextModeIdx = (driverThread.data.vehicleMode + 1) % curVehModeNames.length;
  const nextMode = curVehModeNames[nextModeIdx];

  applyVehicleMode(nextMode);
  driverThread.data.vehicleMode = nextModeIdx;
  Notifications.add(
    `Switched to ${
      nextMode === 'base'
        ? CLASS_ORDER[CLASS_ORDER.indexOf(curVehModeNames[1]) + 1].toUpperCase()
        : nextMode.toUpperCase()
    } mode`,
    'info',
    2000
  );

  if (modeSyncTimeout) {
    modeSyncTimeout.refresh();
  } else {
    const modeSwitchInfo = {
      model: driverThread.data.config.model,
      mode: nextMode,
      prevMode: prevModeName,
    };
    modeSyncTimeout = setTimeout(() => {
      modeSyncTimeout = null;
      Events.emitNet('vehicles:modes:log', modeSwitchInfo);
    }, 2000);
  }
});

Keys.register('cycleVehicleMode', '(vehicles) Cycle vehicle mode', 'B');

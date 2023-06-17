import { Events, Notifications, RPC, UI } from '@dgx/client';
import { STEPS, WHEELS } from './constants.stances';
import { removeInfoNotif, roundOffset } from './helpers.stances';
import { getCurrentVehicle, isDriver, useDummyVehicle } from '@helpers/vehicle';
import { setEngineState } from 'services/engine';
import { getStanceFromPossibilities } from '@shared/stances/helpers.stances';
import { Util } from '@dgx/shared';

const closeVehicles: Map<number, Stances.Stance> = new Map();
let stancingThread: NodeJS.Timer | null = null;
let reapplyTimeout: NodeJS.Timeout | null = null;

let stanceMenuOpen = false;
let changeStep = 0.005;
let isResetting = false;

export const getChangeStep = () => changeStep;

export const cycleChangeStep = () => {
  const currentIndex = STEPS.findIndex(s => s === changeStep);
  const newIndex = ((currentIndex === -1 ? 0 : currentIndex) + 1) % STEPS.length;
  changeStep = STEPS[newIndex];
  return changeStep;
};

export const setCloseVehicleStance = (vehicle: number, stanceData: Stances.Stance | null) => {
  if (!stanceData) {
    closeVehicles.delete(vehicle);
    return;
  }

  closeVehicles.set(vehicle, stanceData);

  if (closeVehicles.size !== 0) {
    startStancingThread();
  }
};

// Apply visual stancing for close vehicles
const startStancingThread = () => {
  if (stancingThread !== null) return;

  stancingThread = setInterval(() => {
    for (const [veh, stance] of closeVehicles) {
      if (!DoesEntityExist(veh)) {
        closeVehicles.delete(veh);
        return;
      }

      SetVehicleWheelXOffset(veh, 0, -stance.frontLeft);
      SetVehicleWheelXOffset(veh, 1, stance.frontRight);
      SetVehicleWheelXOffset(veh, 2, -stance.backLeft);
      SetVehicleWheelXOffset(veh, 3, stance.backRight);
    }

    if (closeVehicles.size === 0) {
      stopStancingThread();
    }
  }, 1);
};

const stopStancingThread = () => {
  if (stancingThread === null) return;
  clearInterval(stancingThread);
  stancingThread = null;
};

export const getVehicleStance = (vehicle: number): Stances.Stance => {
  if (!NetworkGetEntityIsNetworked(vehicle)) {
    const stanceState = Entity(vehicle).state.stance;
    if (stanceState) return stanceState;
  }

  return WHEELS.reduce((stance, wheel) => {
    stance[wheel.name] = Math.abs(roundOffset(GetVehicleWheelXOffset(vehicle, wheel.idx)));
    return stance;
  }, {} as Stances.Stance);
};

export const setVehicleStance = (vehicle: number, stance: Stances.Stance) => {
  clearReapplyTimeout();
  Entity(vehicle).state.set('stance', stance, true);
};

export const getOriginalStance = (vehicle: number) => useDummyVehicle(GetEntityModel(vehicle), getVehicleStance);

export const revertOriginalStance = async (vehicle: number) => {
  isResetting = true;
  reapplyVehicleStance(vehicle, false, true, false);
};

export const openStanceMenu = () => {
  if (stanceMenuOpen) return;

  const vehicle = getCurrentVehicle();
  if (!vehicle || !isDriver()) {
    Notifications.add('Je zit niet in een voertuig als bestuurder', 'error');
    return;
  }

  setEngineState(vehicle, false, true);
  stanceMenuOpen = true;

  const menuData: ContextMenu.Entry[] = [
    {
      title: 'Stancing Menu',
      description: 'Change stancing of corresponding wheel',
      disabled: true,
    },
    {
      title: 'Move Camera',
      description: 'Reposition camera',
      callbackURL: 'stances/moveCam',
    },
    {
      title: 'Copy To Clipboard',
      callbackURL: 'stances/clipboard',
      preventCloseOnClick: true,
    },
    {
      title: 'Reset',
      description: 'Can take a while to apply! (best to respawn vehicle)',
      callbackURL: 'stances/reset',
    },
    ...WHEELS.map(wheel => ({
      title: wheel.label,
      submenu: [
        {
          title: 'Cycle Step',
          description: 'Change amount of increase/decrese on each step',
          callbackURL: 'stances/cycleStep',
          preventCloseOnClick: true,
        },
        {
          title: 'Increase',
          callbackURL: 'stances/change',
          preventCloseOnClick: true,
          data: {
            wheel: wheel.name,
            action: 'increase',
          },
        },
        {
          title: 'Decrease',
          callbackURL: 'stances/change',
          preventCloseOnClick: true,
          data: {
            wheel: wheel.name,
            action: 'decrease',
          },
        },
        {
          title: 'Copy To Other Side',
          description: 'Copy these settings to other side of vehicle',
          callbackURL: 'stances/copy',
          preventCloseOnClick: true,
          data: {
            wheel: wheel.name,
          },
        },
      ],
    })),
  ];

  UI.openApplication('contextmenu', menuData);
};

export const handleStanceMenuClose = () => {
  if (!stanceMenuOpen) return;

  stanceMenuOpen = false;
  removeInfoNotif();

  const vehicle = getCurrentVehicle(true);
  if (!vehicle) return;

  setEngineState(vehicle, true, true);

  if (isResetting) {
    isResetting = false;
    return;
  }

  const stance = getVehicleStance(vehicle);
  Events.emitNet('vehicles:stances:saveAsOverride', NetworkGetNetworkIdFromEntity(vehicle), stance);
};

export const validateStanceMenuButtonAction = () => {
  if (!stanceMenuOpen) return;

  const vehicle = getCurrentVehicle();
  if (!vehicle) {
    Notifications.add('Je zit niet in een voertuig', 'error');
    return;
  }

  if (!isDriver()) {
    Notifications.add('Je zit niet als bestuurder', 'error');
    return;
  }

  return vehicle;
};

export const getStanceConfigForModel = async (vehicle: number) => {
  const modelConfig = await RPC.execute<Stances.Model | undefined>(
    'vehicles:stances:getModelConfig',
    GetEntityModel(vehicle)
  );
  return modelConfig ?? null;
};

export const applyModelStance = async ({
  model,
  vehicle,
  component,
  value,
}: {
  model: Stances.Model;
  vehicle: number;
  component: string;
  value: number;
}) => {
  if (model?.upgrade?.component !== component) return;

  const stance = getStanceFromPossibilities(model.upgrade.possibilities, value);
  if (!stance) {
    reapplyVehicleStance(vehicle, true, false, true);
    return;
  }
  setVehicleStance(vehicle, stance);
};

export const reapplyVehicleStance = (
  vehicle: number,
  useThrottle: boolean,
  clearOverride: boolean,
  ignoreUpgrades: boolean
) => {
  clearReapplyTimeout();

  reapplyTimeout = setTimeout(
    async () => {
      reapplyTimeout = null;
      const originalStance = await getOriginalStance(vehicle);
      Events.emitNet(
        'vehicles:stances:reapply',
        NetworkGetNetworkIdFromEntity(vehicle),
        originalStance,
        clearOverride,
        ignoreUpgrades
      );
    },
    useThrottle ? 500 : 0
  );
};

const clearReapplyTimeout = () => {
  if (!reapplyTimeout) return;
  clearTimeout(reapplyTimeout);
  reapplyTimeout = null;
};

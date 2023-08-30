// Fuel level of vehicle ply is in
import { Events, Sounds, Sync, Util, Weapons } from '@dgx/client';
import { setEngineState } from 'services/engine';
import { isInZone } from './zones.fuel';
import { CONSUMATION_PER_SECOND, VEHICLE_BEEP_LEVELS } from './constants.fuel';

let fuelLevel = 0;

let fuelThreadRunning = false;
let fuelThread: NodeJS.Timer | null = null;
let syncThread: NodeJS.Timer | null = null;

let fuelThreadPaused = false;

export const setFuelLevel = (level: number) => {
  fuelLevel = Math.max(0, Math.min(100, isNaN(level) ? 0 : level));
  emit('vehicles:fuel:change', level);
};

// Fetch from state to set local variable on vehicle enter
export const fetchFuelLevelOnEnter = (vehicle: number) => {
  const fuelFromState = +(Entity(vehicle).state.fuelLevel ?? 0);
  setFuelLevel(fuelFromState);
};

// The driver is always the owner of the vehicle
// Knowing this, we can utilize statebags and directly setVehicleFuelLevel without sync
export const startFuelThread = (vehicle: number) => {
  if (fuelThreadRunning) return;

  // Bicycles don't have fuel
  const vehClass = GetVehicleClass(vehicle);
  if (vehClass == 13) return;

  fuelThreadRunning = true;
  fuelThread = setInterval(() => {
    if (!vehicle || !DoesEntityExist(vehicle)) return;
    if (fuelThreadPaused) return;
    if (!GetIsVehicleEngineRunning(vehicle)) return;

    const vehRPM = GetVehicleCurrentRpm(vehicle);
    // Exponential growth ((2 ** Modifier) - 1) * Max
    const mod = (2 ** vehRPM - 1) * CONSUMATION_PER_SECOND;
    setFuelLevel(fuelLevel - mod);
    if (fuelLevel === 0) {
      setEngineState(vehicle, false, true);
    }

    SetVehicleFuelLevel(vehicle, fuelLevel);
    const oldLevel = fuelLevel + mod;
    for (const lvl of VEHICLE_BEEP_LEVELS) {
      if (fuelLevel <= lvl && oldLevel > lvl) {
        const netId = NetworkGetNetworkIdFromEntity(vehicle);
        Sounds.playOnEntity(`vehicles_fuel_${netId}`, 'lowfuel', 'DLC_NUTTY_SOUNDS', vehicle);
        break;
      }
    }
  }, 1000);
  syncThread = setInterval(() => {
    Entity(vehicle).state.set('fuelLevel', fuelLevel, true);
  }, 20000);
};

export const cleanFuelThread = (vehicle: number) => {
  if (!fuelThreadRunning) return;

  if (fuelThread) {
    clearInterval(fuelThread);
    fuelThread = null;
  }
  if (syncThread) {
    clearInterval(syncThread);
    syncThread = null;
  }

  // Save fuel to server, when leaving we might not be owner anymore so for safety we dont use statebag setter
  if (vehicle && NetworkGetEntityIsNetworked(vehicle)) {
    overrideSetFuel(vehicle, fuelLevel);
  }

  fuelThreadRunning = false;
};

export const canRefuel = (veh: number): boolean => {
  if (!isInZone() && !isHoldingJerryCan()) return false;
  if (IsPedInAnyVehicle(PlayerPedId(), false)) return false;
  const vehClass = GetVehicleClass(veh);
  if (13 === vehClass) {
    return false;
  }
  return Math.min(Util.getBoneDistance(veh, 'wheel_lr'), Util.getBoneDistance(veh, 'wheel_rr')) <= 1.2;
};

export const doRefuel = async (netId: number, usingJerryCan = false) => {
  const veh = NetworkGetEntityFromNetworkId(netId);
  if (GetIsVehicleEngineRunning(veh)) {
    // Calculate the chance on a engine explosion
    const chance = Util.getRndInteger(1, 101);
    if (chance < 10) {
      Sync.executeAction('NetworkExplodeVehicle', veh, true, false, false);
    }
  }
  Events.emitNet('vehicles:fuel:doRefuel', netId, usingJerryCan);
};

export const pauseFuelThread = (pause: boolean) => {
  fuelThreadPaused = pause;
};

export const getVehicleFuel = (vehicle: number) => {
  return Entity(vehicle).state.fuelLevel;
};

// Use if you are not sure you are entityowner
export const overrideSetFuel = (vehicle: number, fuelLevel: number) => {
  Events.emitNet('vehicle:fuel:overrideSet', NetworkGetNetworkIdFromEntity(vehicle), fuelLevel);
};

export const isHoldingJerryCan = () => {
  return Weapons.getCurrentWeaponData()?.name === 'weapon_petrolcan';
};

import { Events, RPC, Sounds, Util, Vehicles } from '@dgx/client';

import { getCurrentVehicle, isDriver } from '../../helpers/vehicle';

import {
  MINIMUM_DAMAGE_FOR_GUARANTEED_STALL,
  MINIMUM_DAMAGE_FOR_STALL,
  degradationValues,
  handlingOverrideFunctions,
} from './constant.status';
import { getVehicleFuel, overrideSetFuel } from 'modules/fuel/service.fuel';
import { getVehicleVin } from 'modules/identification/service.identification';
import { tryEjectAfterCrash } from 'modules/seatbelts/service.seatbelts';
import { setEngineState } from 'services/engine';
import { hasVehicleKeys } from 'modules/keys/cache.keys';

let vehicleService: {
  vehicle: number;
  numWheels: number;
  vin: string;
  threads: {
    status: NodeJS.Timer;
    apply: NodeJS.Timer;
    sync: NodeJS.Timer;
  };
  info: Service.Status;
  state: Record<'engine' | 'body', number>;
  originalHandling: Record<string, number>;
} | null = null;

const multipliers = {
  brake: 1,
};

let vehicleCrashThread: NodeJS.Timer | null = null;

let overrideThreads: NodeJS.Timer[] = [];
const clearOverrideThreads = () => {
  overrideThreads.forEach(t => clearInterval(t));
  overrideThreads = [];
};

// region Service status
const getOriginalHandlingValues = (vehicle: number) => {
  // if already in statebag, use those. else get from native and save in statebag
  const entState = Entity(vehicle).state;
  const handlingValuesFromState = entState.handlingValues;
  if (handlingValuesFromState) return handlingValuesFromState;

  const originalHandling: Record<string, number> = {};

  for (const part in degradationValues) {
    for (const value of degradationValues[part as keyof Service.Status]) {
      const isOverride = !!handlingOverrideFunctions[value.name];
      const original = isOverride ? 1 : GetVehicleHandlingFloat(vehicle, 'CHandlingData', value.name);
      originalHandling[value.name] = original;
    }
  }

  entState.set('handlingValues', originalHandling, false);

  return originalHandling;
};

const applyHandlingValues = (vehicle: number, handlingValues: Record<string, number>) => {
  for (const [key, value] of Object.entries(handlingValues)) {
    if (handlingOverrideFunctions[key]) return;
    SetVehicleHandlingFloat(vehicle, 'CHandlingData', key, Number(value));
  }
  clearOverrideThreads();
};

const calculateDegrationSteps = (handlingValues: Record<string, number>) => {
  for (const part in degradationValues) {
    for (const value of degradationValues[part as keyof Service.Status]) {
      const original = handlingValues[value.name];
      value.bottom = original * value.percent;
      value.step = (original - value.bottom) / 1000;
    }
  }
};

const setVehicleDegradation = (veh: number) => {
  if (!vehicleService) return;

  clearOverrideThreads();

  for (const part in vehicleService.info) {
    for (const value of degradationValues[part as keyof Service.Status]) {
      const partValue = Math.max(0, vehicleService.info[part as keyof Service.Status]);
      const newValue = value.bottom + value.step * partValue;
      if (handlingOverrideFunctions[value.name]) {
        overrideThreads.push(
          setInterval(() => {
            handlingOverrideFunctions[value.name](veh, newValue);
          }, 1)
        );
      } else {
        SetVehicleHandlingFloat(veh, 'CHandlingData', value.name, newValue);
      }
    }
  }
};

// Thread gets started whenever player entered driver seat of a vehicle
export const startStatusThread = async (vehicle: number) => {
  if (vehicleService !== null) {
    console.error('Status threads already running, canceling');
    return;
  }

  const netId = NetworkGetNetworkIdFromEntity(vehicle);
  const vin = await getVehicleVin(vehicle);
  if (!netId || !vin) return;

  const info = await RPC.execute('vehicles:service:getStatus', netId);
  const state = {
    engine: GetVehicleEngineHealth(vehicle),
    body: GetVehicleBodyHealth(vehicle),
  };

  const originalHandling = getOriginalHandlingValues(vehicle);

  // Calc handling values
  calculateDegrationSteps(originalHandling);
  setVehicleDegradation(vehicle);

  const threads = {
    // Statusthread calculates the vehicle status every 100ms
    status: setInterval(() => {
      if (vehicle === null || !DoesEntityExist(vehicle) || GetPedInVehicleSeat(vehicle, -1) !== PlayerPedId()) return;
      if (!vehicleService) return;

      const brakePressure: number[] = [];
      const suspCompress: number[] = [];
      for (let i = 0; i < vehicleService.numWheels; i++) {
        brakePressure.push(GetVehicleWheelBrakePressure(vehicle, i));
        suspCompress.push(GetVehicleWheelSuspensionCompression(vehicle, i));
      }

      // Brakes
      // Brake natives give wrong values when engine is off
      if (GetIsVehicleEngineRunning(vehicle)) {
        const avgBrakePressure = Util.average(brakePressure);
        if (avgBrakePressure <= 0) {
          multipliers.brake = 1;
        } else {
          const brakeDecrease = (avgBrakePressure * multipliers.brake) / 50;
          vehicleService.info.brakes = Math.max(vehicleService.info.brakes - brakeDecrease, 0);
          multipliers.brake += 0.05;
        }
      }

      // Suspension
      const avgSuspCompress = Util.average(suspCompress);
      if (avgSuspCompress > 0.18) {
        const suspDecrease = avgSuspCompress / 45;
        vehicleService.info.suspension = Math.max(vehicleService.info.suspension - suspDecrease, 0);
      }

      // Axle & engine
      const newBody = GetVehicleBodyHealth(vehicle);
      const bodyDelta = vehicleService.state.body - newBody;
      vehicleService.state.body = newBody;

      const newEngine = GetVehicleEngineHealth(vehicle);
      const engineDelta = vehicleService.state.engine - newEngine;
      vehicleService.state.engine = newEngine;

      if (bodyDelta > 0) {
        const axleDecrease = bodyDelta / 25;
        vehicleService.info.axle = Math.max(vehicleService.info.axle - axleDecrease, 0);
      }
      if (engineDelta > 0) {
        const engineDecrease = engineDelta / 15;
        vehicleService.info.engine = Math.max(vehicleService.info.engine - engineDecrease, 0);
      }
    }, 100),
    // Every 5 seconds we apply calculated service degradation
    apply: setInterval(() => {
      if (!vehicleService) return;
      setVehicleDegradation(vehicle);
    }, 5000),
    // Every minute we sync calculated service values
    sync: setInterval(() => {
      if (!vehicleService) return;
      Events.emitNet('vehicles:service:saveStatus', vehicleService.vin, vehicleService.info);
    }, 60000),
  };

  // save data for later
  vehicleService = {
    vehicle,
    numWheels: GetVehicleNumberOfWheels(vehicle),
    vin,
    threads,
    info,
    state,
    originalHandling,
  };

  // init degradation
  setVehicleDegradation(vehicle);
};

export const cleanStatusThread = () => {
  if (!vehicleService) return;

  Events.emitNet('vehicles:service:saveStatus', vehicleService.vin, vehicleService.info);

  if (DoesEntityExist(vehicleService.vehicle)) {
    applyHandlingValues(vehicleService.vehicle, vehicleService.originalHandling);
  }

  if (vehicleService.threads) {
    for (const thread of Object.values(vehicleService.threads)) {
      clearInterval(thread);
    }
  }

  vehicleService = null;
};
// endregion

export const fixVehicle = (veh: number, body = true, engine = true) => {
  if (body) {
    // Fuel level gets reset by the fix native, set to original after calling native
    const fuelLevel = getVehicleFuel(veh);
    SetVehicleBodyHealth(veh, 1000);
    SetVehicleDeformationFixed(veh);
    SetVehicleFixed(veh);
    for (let i = 0; i < 6; i++) {
      SetVehicleTyreFixed(veh, i);
      SetTyreHealth(veh, i, 1000);
    }
    overrideSetFuel(veh, fuelLevel);
  }
  if (engine) {
    SetVehicleEngineHealth(veh, 1000);
  }
};

// Thread to be able to call functions when vehicle crashes
export const startVehicleCrashThread = (vehicle: number) => {
  stopVehicleCrashThread();

  let oldVelocity = Util.getEntityVelocity(vehicle);
  let oldSpeed = Vehicles.getVehicleSpeed(vehicle);
  let oldHealth = GetVehicleBodyHealth(vehicle);

  vehicleCrashThread = setInterval(() => {
    const newHealth = GetVehicleBodyHealth(vehicle);
    const newSpeed = Vehicles.getVehicleSpeed(vehicle);

    if (oldHealth - newHealth > 1) {
      // console.log(`Vehicle crashed | speed: ${oldSpeed} -> ${newSpeed} | health: ${oldHealth} -> ${newHealth}`);
      tryEjectAfterCrash(oldSpeed, newSpeed, oldVelocity);
      tryToStallVehicle(vehicle, newHealth, oldHealth);
    }

    oldVelocity = Util.getEntityVelocity(vehicle);
    oldSpeed = newSpeed;
    oldHealth = newHealth;
  }, 25);
};

export const stopVehicleCrashThread = () => {
  if (vehicleCrashThread === null) return;

  clearInterval(vehicleCrashThread);
  vehicleCrashThread = null;
};

export const tryToStallVehicle = (vehicle: number, newHealth: number, oldHealth: number) => {
  if (!isDriver()) return;
  if (!GetIsVehicleEngineRunning(vehicle)) return;

  const healthDecrease = oldHealth - newHealth;
  if (healthDecrease < MINIMUM_DAMAGE_FOR_STALL) return;

  const chance =
    (Math.min(healthDecrease, MINIMUM_DAMAGE_FOR_GUARANTEED_STALL) - MINIMUM_DAMAGE_FOR_STALL) *
    (100 / (MINIMUM_DAMAGE_FOR_GUARANTEED_STALL - MINIMUM_DAMAGE_FOR_STALL));
  if (Util.getRndInteger(0, 101) > chance) return;

  const entState = Entity(vehicle).state;
  const amountOfStalls = (entState.amountOfStalls ?? 0) + 1;
  entState.set('amountOfStalls', amountOfStalls, true);

  entState.set('undriveable', true, true); // stops us from reenabling engine
  setEngineState(vehicle, false, true);

  // Dont reenable engine if you dont have keys
  setTimeout(() => {
    entState.set('undriveable', false, true);

    if (hasVehicleKeys(vehicle)) {
      setEngineState(vehicle, true, true);
    }
  }, 3000);

  Sounds.playOnEntity(
    `stall_${NetworkGetNetworkIdFromEntity(vehicle)}`,
    'Engine_fail',
    'DLC_PILOT_ENGINE_FAILURE_SOUNDS',
    vehicle
  );

  if (amountOfStalls >= 4) {
    SetVehicleEngineHealth(vehicle, 0);
  }
};

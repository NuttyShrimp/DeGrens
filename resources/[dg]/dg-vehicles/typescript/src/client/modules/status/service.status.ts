import { Events, RPC, Sounds, Util, Vehicles, Sync } from '@dgx/client';
import { isDriver } from '../../helpers/vehicle';
import { MINIMUM_DAMAGE_FOR_GUARANTEED_STALL, MINIMUM_DAMAGE_FOR_STALL, degradationValues } from './constant.status';
import { getVehicleVin } from 'modules/identification/service.identification';
import { tryEjectAfterCrash } from 'modules/seatbelts/service.seatbelts';
import { setEngineState } from 'services/engine';
import { hasVehicleKeys } from 'modules/keys/cache.keys';
import {
  applyHandlingMultipliers,
  resetHandlingContextMultiplier,
  setHandlingContextMultiplier,
} from 'services/handling';
import { getTyreState } from './helpers.status';

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
} | null = null;

const multipliers = {
  brake: 1,
};

let vehicleCrashThread: NodeJS.Timer | null = null;

// region Service status

const setVehicleDegradation = (veh: number) => {
  if (!vehicleService) return;

  for (const part of Object.keys(vehicleService.info) as (keyof Service.Status)[]) {
    for (const value of degradationValues[part]) {
      const partValue = Math.max(0, vehicleService.info[part]);
      const newValue = 1 - value.step * (1000 - partValue);
      setHandlingContextMultiplier(veh, value.name, 'degradation', 'multiplier', newValue, 0);
    }
  }

  applyHandlingMultipliers(veh);
};

// Thread gets started whenever player entered driver seat of a vehicle
export const startStatusThread = async (vehicle: number) => {
  if (vehicleService !== null) {
    console.error('Status threads already running, canceling');
    return;
  }

  const netId = NetworkGetNetworkIdFromEntity(vehicle);
  const vin = await getVehicleVin(vehicle);
  if (!netId || !vin || [13, 14, 15, 16].includes(GetVehicleClass(vehicle))) return;

  const info = await RPC.execute('vehicles:service:getStatus', netId);
  const state = {
    engine: GetVehicleEngineHealth(vehicle),
    body: GetVehicleBodyHealth(vehicle),
  };

  // Calc handling values
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

      let poppedTireModifier = 1 + getTyreState(vehicle).filter(t => t === -1).length;

      // Brakes
      // Brake natives give wrong values when engine is off
      if (GetIsVehicleEngineRunning(vehicle)) {
        const avgBrakePressure = Util.average(brakePressure);
        if (avgBrakePressure <= 0) {
          multipliers.brake = 1;
        } else {
          const brakeDecrease = (avgBrakePressure * multipliers.brake) / 35;
          vehicleService.info.brakes = Math.max(vehicleService.info.brakes - brakeDecrease, 0);
          multipliers.brake = Math.max(multipliers.brake - 0.03, 0);
        }
      }

      // Suspension
      const avgSuspCompress = Util.average(suspCompress);
      if (avgSuspCompress > 0.1) {
        const suspDecrease = avgSuspCompress / 75;
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
        const axleDecrease = (bodyDelta * poppedTireModifier) / 20;
        vehicleService.info.axle = Math.max(vehicleService.info.axle - axleDecrease, 0);
      }
      if (engineDelta > 0) {
        const engineDecrease = engineDelta / 10;
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
  };

  // init degradation
  setVehicleDegradation(vehicle);
};

export const cleanStatusThread = () => {
  if (!vehicleService) return;

  Events.emitNet('vehicles:service:saveStatus', vehicleService.vin, vehicleService.info);

  if (DoesEntityExist(vehicleService.vehicle)) {
    resetHandlingContextMultiplier(vehicleService.vehicle, 'degradation');
    applyHandlingMultipliers(vehicleService.vehicle);
  }

  if (vehicleService.threads) {
    for (const thread of Object.values(vehicleService.threads)) {
      clearInterval(thread);
    }
  }

  vehicleService = null;
};
// endregion

export const setNativeStatus = (vehicle: number, status: Partial<Omit<Vehicle.VehicleStatus, 'fuel'>>) => {
  Sync.executeAction('vehicles:status:setNative', vehicle, status);
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
      tryToStallVehicle(vehicle, newHealth, oldHealth, newSpeed, oldSpeed);
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

export const tryToStallVehicle = (
  vehicle: number,
  newHealth: number,
  oldHealth: number,
  newSpeed: number,
  oldSpeed: number
) => {
  if (!isDriver()) return;
  if (!GetIsVehicleEngineRunning(vehicle)) return;

  if (newSpeed > oldSpeed * 0.85) return; // need atleast 15% diff in speed, to prevent a kick stalling veh

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

export const fixVehicle = (vehicle: number, keepTyreState = false) => {
  Sync.executeAction('vehicles:status:fix', vehicle, keepTyreState);
};

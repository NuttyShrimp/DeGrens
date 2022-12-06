// Fuel level of vehicle ply is in
import { Events, Notifications, RPC, Sync, Taskbar, UI, Util } from '@dgx/client';
import { setEngineState } from 'services/engine';

import { getCurrentVehicle } from '../../helpers/vehicle';

import { isInZone } from './zones.fuel';

let fuelLevel = 0;
let fuelThread: NodeJS.Timer | null = null;
let syncThread: NodeJS.Timer | null = null;
// How long a full tank lasts in minutes
const FULL_TANK_LAST = 15;
const CONSUMATION_PER_SECOND = 100 / (FULL_TANK_LAST * 60);
const VEHICLE_BEEP_LEVELS = [10, 5, 0];
const REFUEL_DURATION_PER_LEVEL = 350;

let fuelThreadPaused = false;

const syncFuel = () => {
  const veh = getCurrentVehicle();
  if (!veh || !NetworkGetEntityIsNetworked(veh)) return;
  Events.emitNet('vehicle:fuel:updateForNetId', NetworkGetNetworkIdFromEntity(veh), fuelLevel);
};

export const setFuelLevel = (level: number) => {
  fuelLevel = Math.max(0, level);
  emit('vehicles:fuel:change', level);
};

export const fetchVehicleFuelLevel = async (veh: number, seat: number) => {
  const vehClass = GetVehicleClass(veh);
  // Bicycles don't have fuel
  if (vehClass == 13) return;

  const level = await RPC.execute<number>('vehicle:fuel:getByNetId', NetworkGetNetworkIdFromEntity(veh));
  if (!level) return;
  setFuelLevel(level);

  // Driver also handles fuel threads
  if (seat !== -1) return;
  startFuelThread(veh);
};

export const startFuelThread = (veh: number) => {
  cleanFuelThread();
  fuelThread = setInterval(() => {
    if (!veh || !DoesEntityExist(veh)) {
      cleanFuelThread();
      return;
    }
    if (fuelThreadPaused) return;
    if (!GetIsVehicleEngineRunning(veh)) return;
    const vehRPM = GetVehicleCurrentRpm(veh);
    // Exponential growth ((2 ** Modifier) - 1) * Max
    const mod = (2 ** vehRPM - 1) * CONSUMATION_PER_SECOND;
    setFuelLevel(fuelLevel - mod);
    if (fuelLevel === 0) {
      setEngineState(veh, false, true);
    }
    Sync.executeNative('SetVehicleFuelLevel', NetworkGetNetworkIdFromEntity(veh), fuelLevel);
    const oldLevel = fuelLevel + mod;
    for (const lvl of VEHICLE_BEEP_LEVELS) {
      if (fuelLevel <= lvl && oldLevel > lvl) {
        global.exports['nutty-sounds'].playSoundOnEntity('vehicles_fuel_10', 'lowfuel', 'DLC_NUTTY_SOUNDS', veh);
        break;
      }
    }
  }, 1000);
  syncThread = setInterval(syncFuel, 20000);
};

export const cleanFuelThread = () => {
  if (fuelThread) {
    clearInterval(fuelThread);
    fuelThread = null;
  }
  if (syncThread) {
    clearInterval(syncThread);
    syncThread = null;
  }
  syncFuel();
};

export const openRefuelMenu = async (vin: string) => {
  const priceInfo = await RPC.execute<{ price: number; fuel: number }>('vehicles:fuel:getPrice', vin);
  if (!priceInfo) return;
  UI.openApplication('contextmenu', [
    {
      id: 'vehicles_fuel_price',
      title: 'Tankstation',
      description: `Prijs: €${priceInfo.price} incl. BTW`,
      icon: 'gas-pump',
      callbackURL: 'vehicles:fuel:startRefuel',
      data: {
        price: priceInfo.price,
        vin,
        fuel: priceInfo.fuel,
      },
    },
  ]);
};

export const canRefuel = (veh: number): boolean => {
  if (!isInZone()) return false;
  if (IsPedInAnyVehicle(PlayerPedId(), false)) return false;
  veh = NetworkGetEntityFromNetworkId(veh) !== 0 ? NetworkGetEntityFromNetworkId(veh) : veh;
  const vehClass = GetVehicleClass(veh);
  if ([13, 14, 15, 16].includes(vehClass)) {
    return false;
  }
  return Math.min(Util.getBoneDistance(veh, 'wheel_lr'), Util.getBoneDistance(veh, 'wheel_rr')) <= 1.2;
};

export const doRefuel = async (price: number, vin: string, missingFuel: number) => {
  const vehNetId = await RPC.execute<number>('vehicles:getVehicleByVin', vin);
  if (!vehNetId) {
    throw new Error(`Vehicle with VIN ${vin} does not exist`);
  }
  const veh = NetworkGetEntityFromNetworkId(vehNetId);
  if (veh === 0) {
    throw new Error(`Vehicle with VIN ${vin} not on this client`);
  }
  if (GetIsVehicleEngineRunning(veh)) {
    // Calculate the chance on a engine explosion
    const chance = Math.random();
    if (chance < 0.05) {
      Sync.executeNative('NetworkExplodeVehicle', NetworkGetEntityFromNetworkId(vehNetId), true, false, false);
    }
  }
  const account = await RPC.execute<Financials.Account>('financials:getDefaultAccount');
  if (Math.max(account?.balance ?? 0, global.exports['dg-financials'].getCash()) < price) {
    Notifications.add('Je hebt niet genoeg geld!', 'error');
    return;
  }
  const [wasCanceled] = await Taskbar.create(
    'gas-pump',
    'Tanken',
    Math.max(missingFuel * REFUEL_DURATION_PER_LEVEL, 5000),
    {
      canCancel: true,
      cancelOnDeath: false,
      controlDisables: {
        movement: true,
        combat: true,
      },
      animation: {
        animDict: 'timetable@gardener@filling_can',
        anim: 'gar_ig_5_filling_can',
        flags: 50,
      },
    }
  );
  if (wasCanceled) {
    return;
  }
  Events.emitNet('vehicles:fuel:payRefuel', vin);
};

export const pauseFuelThread = (pause: boolean) => {
  fuelThreadPaused = pause;
};

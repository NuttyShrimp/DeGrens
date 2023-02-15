import { Events, RPC, UI } from '@dgx/client';

import { getCurrentVehicle } from '../../helpers/vehicle';
import { getCurrentWorkingShop } from '../mechanic/service.mechanic';
import { getPerformanceUpgrades } from '../upgrades/service.upgrades';

import { degradationValues, handlingOverrideFunctions, partNames, serviceConditions } from './constant.status';
import { getVehicleFuel, overrideSetFuel } from 'modules/fuel/service.fuel';
import { getVehicleVin } from 'modules/identification/service.identification';

const vehicleService: {
  vehicle: number;
  vin: string;
  threads: {
    status: NodeJS.Timer;
    apply: NodeJS.Timer;
    sync: NodeJS.Timer;
  } | null;
  info: Service.Status | null;
  state: Record<'engine' | 'body', number>;
  originalHandling: Record<string, number>;
} = {
  vehicle: 0,
  vin: '',
  threads: null,
  info: null,
  state: {
    engine: 1000,
    body: 1000,
  },
  originalHandling: {},
};

const multipliers = {
  brake: 1,
};

let overrideThreads: NodeJS.Timer[] = [];
const clearOverrideThreads = () => {
  overrideThreads.forEach(t => clearInterval(t));
  overrideThreads = [];
};

// region Service satuts
const saveHandlingValues = (veh: number) => {
  for (const part in degradationValues) {
    for (const value of degradationValues[part as keyof Service.Status]) {
      const isOverride = !!handlingOverrideFunctions[value.name];
      const original = isOverride ? 1 : GetVehicleHandlingFloat(veh, 'CHandlingData', value.name);
      vehicleService.originalHandling[value.name] = original;
    }
  }
};

const resetHandlingValues = (veh: number) => {
  for (const [hKey, hValue] of Object.entries(vehicleService.originalHandling)) {
    if (handlingOverrideFunctions[hKey]) return;
    SetVehicleHandlingFloat(veh, 'CHandlingData', hKey, hValue);
  }
  clearOverrideThreads();
  vehicleService.originalHandling = {};
};

const calculateDegrationSteps = () => {
  for (const part in degradationValues) {
    for (const value of degradationValues[part as keyof Service.Status]) {
      const original = vehicleService.originalHandling[value.name];
      value.bottom = original * value.percent;
      value.step = (original - value.bottom) / 1000;
    }
  }
};

const setVehicleDegradation = (veh: number) => {
  if (!vehicleService.info) return;

  clearOverrideThreads();

  for (const part in vehicleService.info) {
    for (const value of degradationValues[part as keyof Service.Status]) {
      const newValue = value.bottom + value.step * vehicleService.info[part as keyof Service.Status];
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
  if (vehicleService.threads !== null) {
    console.error('Status threads already running, canceling');
    return;
  }

  const netId = NetworkGetNetworkIdFromEntity(vehicle);
  const vin = await getVehicleVin(vehicle);
  if (!netId || !vin) return;

  vehicleService.vehicle = vehicle;
  vehicleService.vin = vin;
  vehicleService.info = await RPC.execute('vehicles:service:getStatus', netId);
  vehicleService.state.engine = GetVehicleEngineHealth(vehicle);
  vehicleService.state.body = GetVehicleBodyHealth(vehicle);

  // Calc handling values
  saveHandlingValues(vehicle);
  calculateDegrationSteps();

  setVehicleDegradation(vehicle);
  vehicleService.threads = {
    // Statusthread calculates the vehicle status every 100ms
    status: setInterval(() => {
      const currentVehicle = getCurrentVehicle();
      if (
        currentVehicle === null ||
        !DoesEntityExist(currentVehicle) ||
        GetPedInVehicleSeat(currentVehicle, -1) !== PlayerPedId()
      ) {
        cleanStatusThread();
        return;
      }

      if (!vehicleService.info) return;

      const brakePressure: number[] = [];
      const suspCompress: number[] = [];
      for (let i = 0; i < GetVehicleNumberOfWheels(currentVehicle); i++) {
        brakePressure.push(GetVehicleWheelBrakePressure(currentVehicle, i));
        suspCompress.push(GetVehicleWheelSuspensionCompression(currentVehicle, i));
      }

      // Brakes
      // Brake natives give wrong values when engine is off
      if (GetIsVehicleEngineRunning(currentVehicle)) {
        const avgBrakePressure =
          brakePressure.reduce((tSusCom, susComp) => tSusCom + susComp, 0) / brakePressure.length;
        if (avgBrakePressure <= 0) {
          multipliers.brake = 1;
        } else {
          vehicleService.info.brakes -= (avgBrakePressure * multipliers.brake) / 50;
          multipliers.brake += 0.03;
        }
      }

      // Suspension
      const avgSuspCompress = suspCompress.reduce((tSusCom, susComp) => tSusCom + susComp, 0) / suspCompress.length;
      if (avgSuspCompress > 0.15) {
        vehicleService.info.suspension -= avgSuspCompress / 50;
      }

      // Axle & engine
      const newBody = GetVehicleBodyHealth(currentVehicle);
      const bodyDelta = vehicleService.state.body - newBody;
      vehicleService.state.body = newBody;

      const newEngine = GetVehicleEngineHealth(currentVehicle);
      const engineDelta = vehicleService.state.engine - newEngine;
      vehicleService.state.engine = newEngine;

      if (bodyDelta > 0) {
        vehicleService.info.axle -= bodyDelta / 45;
      }
      if (engineDelta > 0) {
        vehicleService.info.engine -= engineDelta / 20;
      }
    }, 100),
    // Apply thread applies calculated service values every 5 seconds
    apply: setInterval(() => {
      setVehicleDegradation(vehicle);
    }, 5000),
    // Every minute we sync calculated service values
    sync: setInterval(() => {
      if (!vehicleService.info) return;
      Events.emitNet('vehicles:service:updateStatus', vehicleService.vin, vehicleService.info);
    }, 60000),
  };
};

const cleanStatusThread = () => {
  Events.emitNet('vehicles:service:updateStatus', vehicleService.vin, vehicleService.info);

  if (DoesEntityExist(vehicleService.vehicle)) {
    resetHandlingValues(vehicleService.vehicle);
  }

  if (vehicleService.threads) {
    for (const thread of Object.values(vehicleService.threads)) {
      clearInterval(thread);
    }
    vehicleService.threads = null;
  }

  vehicleService.vehicle = 0;
  vehicleService.vin = '';
  vehicleService.info = null;
};

export const openServiceStatusOverview = async (veh: number) => {
  if (!DoesEntityExist(veh)) return;
  const serviceInfo = await RPC.execute<Service.Status>(
    'vehicles:service:getStatus',
    NetworkGetNetworkIdFromEntity(veh)
  );
  if (!serviceInfo) return;

  const partMenu: ContextMenu.Entry[] = [];
  let part: keyof Service.Status;
  const plyShop = getCurrentWorkingShop();
  for (part of Object.keys(serviceInfo) as (keyof Service.Status)[]) {
    const partState = serviceInfo[part];
    const partPerc = partState / 10;
    const serviceCondition = serviceConditions.find(sc => sc.percentage <= partPerc);
    partMenu.push({
      title: `${partNames[part]}`,
      description: plyShop
        ? `${partPerc.toFixed(2)}% | ${Math.ceil((100 - partPerc) / 10) || 'no'} parts needed`
        : `${serviceCondition?.label} condition`,
    });
  }

  // Class info
  const info = await RPC.execute<Upgrades.Performance & { class: CarClass; name: string }>(
    'vehicles:service:getVehicleInfo',
    NetworkGetNetworkIdFromEntity(veh)
  );
  const upgrades = getPerformanceUpgrades(veh);
  const infoMenu: ContextMenu.Entry[] = info
    ? [
        {
          title: info.name,
          description: `Class: ${info.class}`,
        },
        {
          title: 'Brakes',
          description: (upgrades?.brakes ?? -1) === -1 ? 'Basis' : `Level ${upgrades!.brakes + 1}`,
        },
        {
          title: 'Engine',
          description: (upgrades?.engine ?? -1) === -1 ? 'Basis' : `Level ${upgrades!.engine + 1}`,
        },
        {
          title: 'Transmission',
          description: (upgrades?.transmission ?? -1) === -1 ? 'Basis' : `Level ${upgrades!.transmission + 1}`,
        },
        {
          title: 'Turbo',
          description: upgrades?.turbo ? `Geinstalleerd` : 'Niet geinstalleerd',
        },
        {
          title: 'Suspension',
          description: (upgrades?.suspension ?? -1) === -1 ? 'Basis' : `Level ${upgrades!.suspension + 1}`,
        },
      ]
    : [];

  const menu: ContextMenu.Entry[] = [
    {
      title: 'Voertuig info',
      submenu: infoMenu,
    },
    {
      title: 'Voertuig status',
      submenu: partMenu,
    },
  ];
  UI.openApplication('contextmenu', menu);
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

import { Events, RPC, UI } from '@dgx/client';

import { getCurrentVehicle } from '../../helpers/vehicle';
import { getCurrentWorkingShop } from '../mechanic/service.mechanic';
import { getPerformanceUpgrades } from '../upgrades/service.upgrades';

import { degradationValues, handlingOverrideFunctions, partNames, serviceConditions } from './constant.status';

let statusThread: NodeJS.Timer | null = null;
let applyThread: NodeJS.Timer | null = null;
let syncThread: NodeJS.Timer | null = null;
let serviceInfo: Service.Status | null = null;
let state = {
  engine: {
    current: 1000,
    delta: 0,
  },
  body: {
    current: 1000,
    delta: 0,
  },
};

const multipliers = {
  brake: 1,
};

// region Service satuts
const calculateHandlingSteps = (veh: number) => {
  const handlingValues = Entity(veh).state.handlingValues;
  if (!DoesEntityExist(veh)) return;
  for (const part in degradationValues) {
    for (const value of degradationValues[part as keyof Service.Status]) {
      const maxHandling = handlingValues[value.name];
      value.step = (maxHandling - maxHandling * value.percent) / 1000;
      value.bottom = maxHandling * value.percent;
    }
  }
};

const saveHandlingValues = (veh: number) => {
  if (Entity(veh).state.handlingValues) return;
  const handlingInfo: Record<string, number> = {};
  for (const part in degradationValues) {
    for (const value of degradationValues[part as keyof Service.Status]) {
      handlingInfo[value.name] = GetVehicleHandlingFloat(veh, 'CHandlingData', value.name);
    }
  }
  Entity(veh).state.set('handlingValues', handlingInfo, true);
};

const setVehicleDegradation = (veh: number) => {
  if (!serviceInfo) return;
  // const handlingInfo: Record<string, number> = {};
  // for (const part in degradationValues) {
  //   for (const value of degradationValues[part as keyof Service.Status]) {
  //     handlingInfo[value.name] = GetVehicleHandlingFloat(veh, 'CHandlingData', value.name);
  //   }
  // }
  // console.log('Applying degradations', serviceInfo, handlingInfo);
  for (const part in serviceInfo) {
    for (const value of degradationValues[part as keyof Service.Status]) {
      const newValue = value.bottom + value.step * serviceInfo[part as keyof Service.Status];
      if (handlingOverrideFunctions?.[value.name]) {
        handlingOverrideFunctions?.[value.name](veh, newValue);
      } else {
        SetVehicleHandlingFloat(veh, 'CHandlingData', value.name, newValue);
      }
    }
  }
};

const resetHandlingValues = (veh: number) => {
  if (!Entity(veh).state.handlingValues) return;
  const handlingValues = Entity(veh).state.handlingValues;
  for (const hValue of Object.keys(handlingValues)) {
    SetVehicleHandlingFloat(veh, 'CHandlingData', hValue, handlingValues[hValue]);
  }
  Entity(veh).state.set('handlingValues', undefined, true);
};

export const startStatusThread = async (veh: number) => {
  cleanStatusThread(veh);
  const vin = Entity(veh).state.vin;
  if (!vin) return;
  serviceInfo = await RPC.execute('vehicles:service:getStatus', NetworkGetNetworkIdFromEntity(veh));
  const plyVeh = getCurrentVehicle();
  if (!plyVeh || veh !== getCurrentVehicle() || GetPedInVehicleSeat(veh, -1) !== PlayerPedId()) return;
  state.engine.current = GetVehicleEngineHealth(veh);
  state.body.current = GetVehicleBodyHealth(veh);

  // Calc handling values
  saveHandlingValues(veh);
  calculateHandlingSteps(veh);

  setVehicleDegradation(veh);
  statusThread = setInterval(() => {
    if (!DoesEntityExist(veh)) {
      cleanStatusThread(veh);
      return;
    }
    if (!serviceInfo) return;
    const newEngine = GetVehicleEngineHealth(veh);
    const newBody = GetVehicleBodyHealth(veh);
    state = {
      engine: {
        current: newEngine,
        delta: state.engine.current - newEngine,
      },
      body: {
        current: newBody,
        delta: state.body.current - newBody,
      },
    };
    // Brakes
    const brakePressure: number[] = [];
    for (let i = 0; i < 10; i++) {
      brakePressure.push(GetVehicleWheelBrakePressure(veh, i));
    }
    const avgBrakePressure =
      brakePressure.reduce((tSusCom, susComp) => tSusCom + susComp, 0) / brakePressure.length || 0;
    if (avgBrakePressure <= 0) {
      multipliers.brake = 1;
    } else {
      serviceInfo.brakes -= (avgBrakePressure * multipliers.brake) / 50;
      multipliers.brake += 0.03;
    }
    // Axle & engine
    if (state.engine.delta >= 75) {
      serviceInfo.axle -= state.engine.delta / 45;
    }
    if (state.engine.delta > 0) {
      serviceInfo.engine -= state.engine.delta / 20;
    }
    // Suspension
    const suspCompress: number[] = [];
    for (let i = 0; i < GetVehicleNumberOfWheels(veh); i++) {
      suspCompress.push(GetVehicleWheelSuspensionCompression(veh, i));
    }
    const avgSuspCompress = suspCompress.reduce((tSusCom, susComp) => tSusCom + susComp, 0) / suspCompress.length || 0;
    if (avgSuspCompress > 0.15) {
      serviceInfo.suspension -= avgSuspCompress / 50;
    }
  }, 100);
  applyThread = setInterval(() => {
    setVehicleDegradation(veh);
  }, 5000);
  // Sync status each minute
  const vehNetId = NetworkGetNetworkIdFromEntity(veh);
  syncThread = setInterval(() => {
    if (!serviceInfo || !veh) return;
    Events.emitNet('vehicles:service:updateStatus', vehNetId, serviceInfo);
  }, 60000);
};

export const cleanStatusThread = (veh?: number) => {
  if (veh && serviceInfo && DoesEntityExist(veh)) {
    const vehNetId = NetworkGetNetworkIdFromEntity(veh);
    Events.emitNet('vehicles:service:updateStatus', vehNetId, serviceInfo);
    if (!GetPedInVehicleSeat(veh, -1)) {
      resetHandlingValues(veh);
    }
  }
  serviceInfo = null;
  if (statusThread) {
    clearInterval(statusThread);
    statusThread = null;
  }
  if (applyThread) {
    clearInterval(applyThread);
    applyThread = null;
  }
  if (syncThread) {
    clearInterval(syncThread);
    syncThread = null;
  }
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
          description: `Level ${upgrades?.brakes ?? 0}`,
        },
        {
          title: 'Engine',
          description: `Level ${upgrades?.engine ?? 0}`,
        },
        {
          title: 'Transmission',
          description: `Level ${upgrades?.transmission ?? 0}`,
        },
        {
          title: 'Turbo',
          description: upgrades?.turbo ? `Installed` : 'Not installed',
        },
        {
          title: 'Suspension',
          description: `Level ${upgrades?.transmission ?? 0}`,
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

// This functions makes tyres invincible so dont use till the natives are fixed or better solution is found!
export const setTyreWear = (veh: number) => {
  for (let i = 0; i < 10; i++) {
    const tyreMultiplier = GetTyreWearMultiplier(veh, i);
    if (tyreMultiplier !== 0.2) {
      SetTyreWearMultiplier(veh, i, 0.2);
    }
  }
};

export const setNativeStatus = (veh: number, status: Omit<Vehicle.VehicleStatus, 'fuel'>) => {
  // server variants do not work
  SetVehicleBodyHealth(veh, status?.body ?? 1000);
  SetVehicleEngineHealth(veh, status?.engine ?? 1000);
  (status.wheels ?? []).forEach((wheel, wheelId) => {
    if (wheel === -1) {
      SetTyreHealth(veh, wheelId, 351);
      SetVehicleTyreBurst(veh, wheelId, true, 1000);
    } else {
      SetTyreHealth(veh, wheelId, wheel);
    }
  });
  (status.doors ?? []).forEach((broken, doorId) => {
    if (!broken) return;
    SetVehicleDoorBroken(veh, doorId, broken);
  });
  (status.windows ?? []).forEach((broken, windowId) => {
    if (!broken) return;
    SmashVehicleWindow(veh, windowId);
  });
};

export const fixVehicle = async (veh: number, body = true, engine = true) => {
  if (body) {
    // Fuel level gets reset by the fix native, set to original after calling native
    const fuelLevel = await RPC.execute<number>('vehicle:fuel:getByNetId', NetworkGetNetworkIdFromEntity(veh));
    SetVehicleBodyHealth(veh, 1000);
    SetVehicleDeformationFixed(veh);
    SetVehicleFixed(veh);
    for (let i = 0; i < 6; i++) {
      SetVehicleTyreFixed(veh, i);
      SetTyreHealth(veh, i, 1000);
    }
    Events.emitNet('vehicle:fuel:updateForNetId', NetworkGetNetworkIdFromEntity(veh), fuelLevel);
  }
  if (engine) {
    SetVehicleEngineHealth(veh, 1000);
  }
};

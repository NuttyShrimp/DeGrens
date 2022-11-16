import { Events, HUD, Notifications, Particle, Sounds } from '@dgx/client';
import { Vector3 } from '@dgx/shared';
import { getCurrentVehicle, isDriver } from '@helpers/vehicle';
import { setEngineState } from 'services/engine';

import { getNosConfig } from './config.nos';
import { exhaustBones } from './constants.nos';

let usingNos = false;
let nosUsageStartAmount = 0;
let nosDepletionThread: NodeJS.Timer | null = null;
let originalPower: number;
let nosPowerThread: NodeJS.Timer | null = null;
let flowrate = 0; // LOW - MEDIUM - HIGH
const ptfxIds: { purge: Set<string>; nos: Set<string> } = { purge: new Set(), nos: new Set() };

let hudIconShown = false;
let hudDisplayAmount = 0;
export const setHudDisplayAmount = (value: number) => (hudDisplayAmount = value);

export const isUsingNos = () => usingNos;

const setVehicleNosAmount = (veh: number, nos: number) => {
  const vehState = Entity(veh).state;
  if (!vehState) return;
  vehState.set('nos', nos, true);
};

const getVehicleNosAmount = (veh: number): number => Entity(veh).state?.nos ?? 0;

export const doesVehicleHaveNos = (veh: number) => getVehicleNosAmount(veh) !== 0;

export const startUsingNos = (veh: number) => {
  if (usingNos) return;

  nosUsageStartAmount = getVehicleNosAmount(veh);
  if (nosUsageStartAmount === getNosConfig().refillAmount) {
    Notifications.add('Vergeet niet te purgen!', 'info');
    return;
  }

  usingNos = true;

  // fix for ptfx stuck when spamming button
  setTimeout(() => {
    if (!usingNos) return;
    addNosPtfx(veh);
  }, 100);

  // Thread manages nos depletion
  const usageLimit = nosUsageStartAmount - getNosConfig().maxPortion;
  const depletionTick = getNosConfig()?.flowrates[flowrate]?.depletionTick ?? 1;
  nosDepletionThread = setInterval(() => {
    const newAmount = Math.max(getVehicleNosAmount(veh) - depletionTick, 0);
    if (newAmount <= usageLimit) {
      setEngineState(veh, false, true);
      Notifications.add('Er is iets kapot gegaan...', 'error');
      stopUsingNos(veh);
      return;
    }
    setVehicleNosAmount(veh, newAmount);
    if (newAmount === 0) {
      stopUsingNos(veh);
    }
  }, 100);

  SetVehicleBoostActive(veh, true);
  originalPower = GetVehicleCheatPowerIncrease(veh);
  const powerMultiplier = getNosConfig()?.flowrates[flowrate]?.powerMultiplier ?? 1.0;
  nosPowerThread = setInterval(() => {
    SetVehicleCheatPowerIncrease(veh, powerMultiplier);
  }, 0);
};

export const purge = (veh: number) => {
  addPurgePtfx(veh);
  Sounds.playOnEntity(`nos_purge_sound_${veh}`, 'nospurge', 'DLC_NUTTY_SOUNDS', veh);
  const currentAmount = getVehicleNosAmount(veh);
  setVehicleNosAmount(veh, currentAmount - 1);
  Events.emitNet('vehicles:nos:save', NetworkGetNetworkIdFromEntity(veh));
};

export const stopUsingNos = (veh: number) => {
  if (!usingNos) return;
  usingNos = false;
  if (nosDepletionThread !== null) {
    clearInterval(nosDepletionThread);
    nosDepletionThread = null;
  }
  if (nosPowerThread !== null) {
    clearInterval(nosPowerThread);
    nosPowerThread = null;
  }
  Events.emitNet('vehicles:nos:save', NetworkGetNetworkIdFromEntity(veh));
  SetVehicleCheatPowerIncrease(veh, originalPower);
  ptfxIds.nos.forEach(id => Particle.remove(id));
  ptfxIds.nos.clear();
};

export const stopPurge = () => {
  Sounds.stop('purge-nos-sound');
  ptfxIds.purge.forEach(id => Particle.remove(id));
  ptfxIds.purge.clear();
};

const addNosPtfx = (veh: number) => {
  for (const boneName of exhaustBones) {
    if (GetEntityBoneIndexByName(veh, boneName) === -1) continue;
    const ptfxId = Particle.add({
      dict: 'veh_xs_vehicle_mods',
      name: 'veh_nitrous',
      netId: NetworkGetNetworkIdFromEntity(veh),
      boneName,
      looped: true,
      scale: 1.3,
    });
    ptfxIds.nos.add(ptfxId);
  }
};

const addPurgePtfx = (veh: number) => {
  if (GetEntityBoneIndexByName(veh, 'bonnet') === -1) return;

  // left and right
  [-1, 1].forEach(side => {
    const ptfxId = Particle.add({
      dict: 'core',
      name: 'ent_sht_steam',
      netId: NetworkGetNetworkIdFromEntity(veh),
      boneName: 'bonnet',
      ignoreBoneRotation: true,
      offset: new Vector3(0.6 * side, 0.05, 0),
      rotation: new Vector3(20, 20 * side, 0.5),
      scale: 0.8,
      looped: true,
    });
    ptfxIds.purge.add(ptfxId);
  });
};

export const cycleFlowrate = () => {
  flowrate = (flowrate + 1) % 3;
  const label = getNosConfig()?.flowrates[flowrate]?.label ?? 'ERROR';
  Notifications.add(`Flowrate: ${label}`, 'info');
};

export const updateHudDisplayAmount = (vehicle: number) => {
  hudDisplayAmount = getVehicleNosAmount(vehicle);
};

export const getNosAmountForHud = () => {
  const veh = getCurrentVehicle();
  if (!veh || !isDriver()) {
    if (hudIconShown) {
      HUD.toggleEntry('nos-amount', false);
      hudIconShown = false;
    }
    return 0;
  }
  if (hudDisplayAmount === 0) {
    if (hudIconShown) {
      HUD.toggleEntry('nos-amount', false);
      hudIconShown = false;
    }
    return 0;
  } else {
    if (!hudIconShown) {
      HUD.toggleEntry('nos-amount', true);
      hudIconShown = true;
    }
    let display = 0;
    if (usingNos) {
      const max = getNosConfig().maxPortion;
      display = ((max - (nosUsageStartAmount - hudDisplayAmount)) / max) * 100;
    } else {
      display = (hudDisplayAmount / getNosConfig().refillAmount) * 100;
    }
    return display;
  }
};

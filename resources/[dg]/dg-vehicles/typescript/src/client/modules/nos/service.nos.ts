import { Events, HUD, Notifications, Particles, Sounds } from '@dgx/client';
import { Vector3 } from '@dgx/shared';
import { getCurrentVehicle, isDriver } from '@helpers/vehicle';
import { setEngineState } from 'services/engine';

import { getNosConfig } from './config.nos';
import { exhaustBones } from './constants.nos';

let isPurging = false;
let usingNos = false;
let nosAmount = 0;
let nosAmountAtStart = 0;

let originalPower: number;

let nosDepletionThread: NodeJS.Timer | null = null;
let nosPowerThread: NodeJS.Timer | null = null;

let flowrate = 0; // LOW - MEDIUM - HIGH
const ptfxIds: { purge: Set<string>; nos: Set<string> } = { purge: new Set(), nos: new Set() };

let hudIconShown = false;

export const updateVehicleNosAmount = (vehicle: number, overrideAmount?: number) => {
  nosAmount = overrideAmount ?? Entity(vehicle).state?.nos ?? 0;
};

export const doesVehicleHaveNos = (veh: number) => nosAmount !== 0;

export const startUsingNos = (veh: number) => {
  if (usingNos) return;

  nosAmountAtStart = nosAmount;
  if (nosAmountAtStart === getNosConfig().refillAmount) {
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
  const usageLimit = nosAmountAtStart - getNosConfig().maxPortion;
  const depletionTick = getNosConfig()?.flowrates[flowrate]?.depletionTick ?? 1;
  nosDepletionThread = setInterval(() => {
    const newAmount = Math.max(nosAmount - depletionTick, 0);
    if (newAmount <= usageLimit) {
      setEngineState(veh, false, true);
      Notifications.add('Er is iets kapot gegaan...', 'error');
      stopUsingNos(veh);
      return;
    }

    nosAmount = newAmount;
    if (nosAmount === 0) {
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
  if (isPurging) return;
  isPurging = true;
  addPurgePtfx(veh);
  Sounds.playOnEntity(`nos_purge_sound_${veh}`, 'nospurge', 'DLC_NUTTY_SOUNDS', veh);
  nosAmount--;
  saveNos(veh);
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

  saveNos(veh);
  SetVehicleCheatPowerIncrease(veh, originalPower);
  ptfxIds.nos.forEach(id => Particles.remove(id));
  ptfxIds.nos.clear();
};

export const resetNos = (vehicle: number) => {
  stopUsingNos(vehicle);
  nosAmount = 0;
};

export const stopPurge = () => {
  if (!isPurging) return;
  isPurging = false;
  Sounds.stop('purge-nos-sound');
  ptfxIds.purge.forEach(id => Particles.remove(id));
  ptfxIds.purge.clear();
};

const addNosPtfx = (veh: number) => {
  for (const boneName of exhaustBones) {
    if (GetEntityBoneIndexByName(veh, boneName) === -1) continue;
    const ptfxId = Particles.add({
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
    const ptfxId = Particles.add({
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

export const getNosAmountForHud = () => {
  const veh = getCurrentVehicle();
  if (!veh || !isDriver()) {
    if (hudIconShown) {
      HUD.toggleEntry('nos-amount', false);
      hudIconShown = false;
    }
    return 0;
  }

  const hasNos = doesVehicleHaveNos(veh);

  if (!hasNos && hudIconShown) {
    HUD.toggleEntry('nos-amount', false);
    hudIconShown = false;
    return 0;
  }

  if (hasNos) {
    if (!hudIconShown) {
      HUD.toggleEntry('nos-amount', true);
      hudIconShown = true;
    }

    if (usingNos) {
      const max = getNosConfig().maxPortion;
      return ((max - (nosAmountAtStart - nosAmount)) / max) * 100;
    } else {
      return (nosAmount / getNosConfig().refillAmount) * 100;
    }
  }

  return 0;
};

// Saved when stop using nos, exited veh
export const saveNos = (vehicle: number) => {
  Events.emitNet('vehicles:nos:save', NetworkGetNetworkIdFromEntity(vehicle), nosAmount);
};

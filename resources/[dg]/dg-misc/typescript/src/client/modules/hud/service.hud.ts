import { Events, HUD, Util, Vehicles } from '@dgx/client';
import { MINIMUM_STRESS_FOR_ICON } from './constants.hud';
import { getMaxUnderwaterTime } from 'services/scubagear';

let config: HUD.Config | null = null;
let isDiving = false;
let stressAmount = 0;
let stressTimeout: NodeJS.Timeout | null = null;
let stressSteps: number;

let stressIconEnabled = false;

export const setConfig = (newConfig: HUD.Config) => {
  config = newConfig;
  stressSteps = (newConfig.shake.interval.max - newConfig.shake.interval.min) / (100 - newConfig.shake.minimum);
};

export const getStressLevel = () => stressAmount;

export const setIsDiving = (diving: boolean) => {
  isDiving = diving;
  HUD.toggleEntry('lung-capacity', isDiving);
};

export const getCapacity = (ped: number, id: number) => {
  if (!isDiving) return 0;
  const maxUnderwaterTime = getMaxUnderwaterTime();
  const underwaterTimeRemaining = GetPlayerUnderwaterTimeRemaining(id);
  return Math.round((underwaterTimeRemaining / maxUnderwaterTime) * 100);
};

export const handleStressChange = (amount: number) => {
  stressAmount = amount;

  // disable when stress is 0, enable when higher than threshold
  stressIconEnabled = stressAmount > (stressIconEnabled ? 0 : MINIMUM_STRESS_FOR_ICON);
  HUD.toggleEntry('stress', stressIconEnabled);

  scheduleBlurEffect();
};

export const doSpeedStress = () => {
  if (!config) return;

  const ped = PlayerPedId();
  const vehicle = GetVehiclePedIsIn(ped, false);
  if (!vehicle || !DoesEntityExist(vehicle)) return;

  const speed = Vehicles.getVehicleSpeed(vehicle);
  const isSeatbeltOn = global.exports['dg-vehicles'].isSeatbeltOn();
  if (speed >= config.speed.minimum * (isSeatbeltOn ? 1.3 : 1)) {
    Events.emitNet('hud:server:changeStress', Util.getRndInteger(1, 3) / 20);
  }
};

const SKIPPED_WEAPONS = [
  'WEAPON_UNARMED',
  'WEAPON_PETROLCAN',
  'WEAPON_HAZARDCAN',
  'WEAPON_FIREEXTINGUISHER',
  'WEAPON_FLASHLIGHT',
].map(w => GetHashKey(w) >>> 0);

export const doWeaponStress = () => {
  if (!config) return;

  const ped = PlayerPedId();
  const pedWeapon = GetSelectedPedWeapon(ped) >>> 0;
  if (
    IsPedShooting(ped) &&
    !SKIPPED_WEAPONS.includes(pedWeapon) &&
    Util.getRndInteger(0, 100) < config.shootingChance
  ) {
    Events.emitNet('hud:server:changeStress', Util.getRndInteger(2, 15) / 10);
  }
};

const scheduleBlurEffect = async () => {
  if (!config) return;
  if (stressTimeout !== null) return;

  const relativeAmount = stressAmount - config.shake.minimum;
  if (relativeAmount <= 0) return;

  const relativeMaxAmount = 100 - config.shake.minimum;
  const blurAmount = Math.ceil((config.shake.maxAmount / relativeMaxAmount) * relativeAmount);
  const blurLength = (config.shake.maxLength / relativeMaxAmount) * relativeAmount;

  // set timeout now instead of after effect, this is to avoid function being called during effect and overwriting timeout
  // blureffect takes longer than provided length
  const blurDuration = (blurLength + 800) * blurAmount;
  const timeout = config.shake.interval.max - stressSteps * relativeAmount;
  stressTimeout = setTimeout(() => {
    stressTimeout = null;
    scheduleBlurEffect();
  }, timeout + blurDuration);

  for (let i = 0; i < blurAmount; i++) {
    await doBlurEffect(blurLength);
  }
};

/**
 * Function takes length + 800ms time to resolve
 */
const doBlurEffect = async (length: number) => {
  TriggerScreenblurFadeIn(250);
  await Util.Delay(length + 300);
  TriggerScreenblurFadeOut(250);
  await Util.Delay(500);
};

export const handleHudModuleResourceStop = () => {
  HUD.removeEntry('stress');
  HUD.removeEntry('lung-capacity');
};
